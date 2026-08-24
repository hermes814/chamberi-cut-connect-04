CREATE TABLE public.citas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  servicio text NOT NULL,
  barbero text NOT NULL,
  fecha date NOT NULL,
  hora text NOT NULL,
  telefono text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (barbero, fecha, hora)
);

GRANT SELECT, INSERT ON public.citas TO anon;
GRANT SELECT, INSERT ON public.citas TO authenticated;
GRANT ALL ON public.citas TO service_role;

ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver las citas" ON public.citas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Cualquiera puede crear una cita" ON public.citas FOR INSERT TO anon, authenticated WITH CHECK (true);