-- Remove broad public read access to citas
DROP POLICY IF EXISTS "Disponibilidad publica solo barbero fecha hora" ON public.citas;

REVOKE ALL ON public.citas FROM anon, authenticated;
GRANT INSERT (nombre, servicio, barbero, fecha, hora, telefono) ON public.citas TO anon, authenticated;
GRANT ALL ON public.citas TO service_role;

-- Availability view exposing only non-sensitive columns (owner rights, bypasses table RLS)
CREATE OR REPLACE VIEW public.disponibilidad
WITH (security_invoker = false) AS
SELECT barbero, fecha, hora
FROM public.citas;

GRANT SELECT ON public.disponibilidad TO anon, authenticated, service_role;