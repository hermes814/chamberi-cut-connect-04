-- Remove the SECURITY DEFINER function; availability is now read via column-restricted SELECT
DROP FUNCTION IF EXISTS public.horas_ocupadas(date);

-- Only non-sensitive columns are readable; nombre/telefono are NOT granted to anon/authenticated
REVOKE SELECT ON public.citas FROM anon, authenticated;
GRANT SELECT (barbero, fecha, hora) ON public.citas TO anon, authenticated;
GRANT ALL ON public.citas TO service_role;

DROP POLICY IF EXISTS "Disponibilidad publica (solo columnas no sensibles)" ON public.citas;
CREATE POLICY "Disponibilidad publica (solo columnas no sensibles)"
ON public.citas
FOR SELECT
TO anon, authenticated
USING (true);
