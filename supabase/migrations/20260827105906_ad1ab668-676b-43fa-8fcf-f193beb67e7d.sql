-- 1) Quitar exposición pública de columnas sensibles
DROP POLICY IF EXISTS "Disponibilidad publica (solo columnas no sensibles)" ON public.citas;

REVOKE SELECT ON public.citas FROM anon, authenticated;
GRANT SELECT (barbero, fecha, hora) ON public.citas TO anon, authenticated;
GRANT ALL ON public.citas TO service_role;

CREATE POLICY "Disponibilidad publica solo barbero fecha hora"
ON public.citas
FOR SELECT
TO anon, authenticated
USING (true);

-- 2) Validación de inserciones públicas
CREATE OR REPLACE FUNCTION public.validar_cita()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  recientes int;
  minutos int;
BEGIN
  NEW.nombre := btrim(NEW.nombre);
  NEW.servicio := btrim(NEW.servicio);
  NEW.barbero := btrim(NEW.barbero);
  NEW.telefono := btrim(NEW.telefono);
  NEW.hora := btrim(NEW.hora);

  IF char_length(NEW.nombre) < 2 OR char_length(NEW.nombre) > 60 THEN
    RAISE EXCEPTION 'Nombre no válido';
  END IF;

  IF char_length(NEW.servicio) < 2 OR char_length(NEW.servicio) > 120 THEN
    RAISE EXCEPTION 'Servicio no válido';
  END IF;

  IF NEW.barbero NOT IN ('Jorge', 'Axel', 'Oscar') THEN
    RAISE EXCEPTION 'Barbero no válido';
  END IF;

  IF NEW.telefono !~ '^[+0-9 ()-]{7,20}$' THEN
    RAISE EXCEPTION 'Teléfono no válido';
  END IF;

  IF NEW.fecha < (now() AT TIME ZONE 'Europe/Madrid')::date
     OR NEW.fecha > ((now() AT TIME ZONE 'Europe/Madrid')::date + 90) THEN
    RAISE EXCEPTION 'Fecha no válida';
  END IF;

  IF EXTRACT(DOW FROM NEW.fecha) = 0 THEN
    RAISE EXCEPTION 'Domingos cerrado';
  END IF;

  IF NEW.hora !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
    RAISE EXCEPTION 'Hora no válida';
  END IF;

  minutos := split_part(NEW.hora, ':', 1)::int * 60 + split_part(NEW.hora, ':', 2)::int;
  IF minutos < 600 OR minutos > 1230 OR (minutos % 30) <> 0 THEN
    RAISE EXCEPTION 'Hora fuera del horario de atención';
  END IF;

  SELECT count(*) INTO recientes
  FROM public.citas
  WHERE created_at > now() - interval '1 minute';

  IF recientes >= 10 THEN
    RAISE EXCEPTION 'Demasiadas solicitudes, inténtalo de nuevo en un momento';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validar_cita_trigger ON public.citas;
CREATE TRIGGER validar_cita_trigger
BEFORE INSERT ON public.citas
FOR EACH ROW EXECUTE FUNCTION public.validar_cita();