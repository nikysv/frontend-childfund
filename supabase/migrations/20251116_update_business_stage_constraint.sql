-- Actualizar el constraint de business_stage para permitir "pendiente"
-- Este valor temporal se usa hasta que el usuario complete el diagnóstico

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_business_stage_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_business_stage_check 
CHECK (business_stage IN ('idea', 'pre-incubacion', 'incubacion', 'pendiente'));

