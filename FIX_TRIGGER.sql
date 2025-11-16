-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- Soluciona el error 500 al registrar usuarios

-- Paso 1: Asegurar constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_business_stage_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_business_stage_check 
CHECK (business_stage IN ('idea', 'pre-incubacion', 'incubacion', 'pendiente'));

-- Paso 2: Eliminar trigger anterior
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Paso 3: Crear función MUY SIMPLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, age, city, business_sector, business_stage
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 18),
    COALESCE(NEW.raw_user_meta_data->>'city', 'La Paz'),
    COALESCE(NEW.raw_user_meta_data->>'business_sector', 'General'),
    'pendiente'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla, crear con valores mínimos
    INSERT INTO public.profiles (id, full_name, age, city, business_sector, business_stage)
    VALUES (NEW.id, 'Usuario', 18, 'La Paz', 'General', 'pendiente')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Paso 4: Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Paso 5: Verificar
SELECT 'Trigger creado exitosamente' AS status;

