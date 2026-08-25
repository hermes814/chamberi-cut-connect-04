DROP POLICY IF EXISTS "Cualquiera puede ver las citas" ON public.citas;

REVOKE SELECT ON public.citas FROM anon, authenticated;
GRANT INSERT ON public.citas TO anon, authenticated;
GRANT ALL ON public.citas TO service_role;

CREATE OR REPLACE FUNCTION public.horas_ocupadas(_fecha date)
RETURNS TABLE (barbero text, hora text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.barbero, c.hora FROM public.citas c WHERE c.fecha = _fecha;
$$;

GRANT EXECUTE ON FUNCTION public.horas_ocupadas(date) TO anon, authenticated;