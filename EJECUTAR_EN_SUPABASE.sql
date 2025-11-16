-- Script para ejecutar en Supabase SQL Editor
-- Este script verifica y corrige el trigger de creación de perfiles

-- 1. Verificar si el constraint permite 'pendiente'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_business_stage_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_business_stage_check 
CHECK (business_stage IN ('idea', 'pre-incubacion', 'incubacion', 'pendiente'));

-- 2. Eliminar trigger y función anteriores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Crear función simple y robusta
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    age,
    city,
    business_sector,
    business_stage
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), 'Usuario'),
    COALESCE(
      CASE 
        WHEN (NEW.raw_user_meta_data->>'age')::INTEGER BETWEEN 16 AND 24 
        THEN (NEW.raw_user_meta_data->>'age')::INTEGER
        ELSE 18
      END,
      18
    ),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'city'), ''), 'La Paz'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'business_sector'), ''), 'General'),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'business_stage'), ''),
      'pendiente'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla, intentar con valores mínimos
    BEGIN
      INSERT INTO public.profiles (id, full_name, age, city, business_sector, business_stage)
      VALUES (NEW.id, 'Usuario', 18, 'La Paz', 'General', 'pendiente')
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- No lanzar error, solo registrar warning
        RAISE WARNING 'Error creando perfil: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$;

-- 4. Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar que se creó correctamente
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

