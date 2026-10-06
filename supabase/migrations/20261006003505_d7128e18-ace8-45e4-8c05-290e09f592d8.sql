CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text NOT NULL UNIQUE DEFAULT ('CHRIS-' || upper(substr(md5(random()::text),1,6))),
  client_name text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  client_phone text NOT NULL DEFAULT '',
  product text NOT NULL DEFAULT '',
  destination text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'en_attente',
  status_notes text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all shipments" ON public.shipments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "client reads own shipments" ON public.shipments FOR SELECT TO authenticated USING (lower(client_email) = lower(coalesce(auth.jwt()->>'email','')));

CREATE OR REPLACE FUNCTION public.track_shipment(_code text)
RETURNS TABLE(tracking_number text, product text, destination text, status text, status_notes text, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tracking_number, product, destination, status, status_notes, updated_at
  FROM public.shipments WHERE upper(tracking_number) = upper(trim(_code)) LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.track_shipment(text) TO anon, authenticated;

CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'html',
  content_data text NOT NULL DEFAULT '{}',
  show_in_menu boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.custom_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT ALL ON public.custom_pages TO service_role;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published pages" ON public.custom_pages FOR SELECT TO anon, authenticated USING (published OR public.is_admin());
CREATE POLICY "admin writes pages" ON public.custom_pages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());