ALTER TABLE public.citas
  ADD CONSTRAINT citas_nombre_valido CHECK (char_length(btrim(nombre)) BETWEEN 2 AND 60) NOT VALID,
  ADD CONSTRAINT citas_servicio_valido CHECK (char_length(btrim(servicio)) BETWEEN 2 AND 120) NOT VALID,
  ADD CONSTRAINT citas_barbero_valido CHECK (btrim(barbero) IN ('Jorge','Oscar')) NOT VALID,
  ADD CONSTRAINT citas_telefono_valido CHECK (btrim(telefono) ~ '^[+0-9 ()-]{7,20}$') NOT VALID,
  ADD CONSTRAINT citas_hora_valida CHECK (btrim(hora) ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') NOT VALID;

REVOKE ALL ON TABLE public.citas FROM anon, authenticated;
GRANT INSERT (nombre, servicio, barbero, fecha, hora, telefono) ON public.citas TO anon, authenticated;
GRANT SELECT (barbero, fecha, hora) ON public.citas TO anon, authenticated;
GRANT ALL ON public.citas TO service_role;

DROP POLICY IF EXISTS "Disponibilidad publica sin datos personales" ON public.citas;
CREATE POLICY "Disponibilidad publica sin datos personales"
  ON public.citas FOR SELECT
  TO anon, authenticated
  USING (fecha >= ((now() AT TIME ZONE 'Europe/Madrid')::date - 1));
