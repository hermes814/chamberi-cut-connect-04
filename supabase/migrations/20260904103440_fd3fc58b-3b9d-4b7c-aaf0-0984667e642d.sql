ALTER VIEW public.disponibilidad SET (security_invoker = true);

GRANT SELECT (barbero, fecha, hora) ON public.citas TO anon, authenticated;

CREATE POLICY "Disponibilidad publica sin datos personales"
ON public.citas
FOR SELECT
TO anon, authenticated
USING (fecha >= ((now() AT TIME ZONE 'Europe/Madrid')::date - 1));