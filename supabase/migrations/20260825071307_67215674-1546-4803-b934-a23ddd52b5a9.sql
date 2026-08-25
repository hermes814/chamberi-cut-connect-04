DROP FUNCTION IF EXISTS public.horas_ocupadas(date);

CREATE POLICY "Cualquiera puede ver disponibilidad"
ON public.citas
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT (barbero, fecha, hora) ON public.citas TO anon, authenticated;