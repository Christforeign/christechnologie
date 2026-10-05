CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT coalesce(auth.jwt()->>'email','') = 'blaisechristeveste@gmail.com'
$$;

CREATE TABLE public.site_content (key text PRIMARY KEY, value text NOT NULL DEFAULT '');
CREATE TABLE public.links (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), label text NOT NULL, url text NOT NULL, position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.media (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL DEFAULT 'image', url text NOT NULL, caption text NOT NULL DEFAULT '', position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.services (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category text NOT NULL DEFAULT '', title text NOT NULL, description text NOT NULL DEFAULT '', price text NOT NULL DEFAULT '', position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text NOT NULL DEFAULT '', price text NOT NULL DEFAULT '', image_url text NOT NULL DEFAULT '', position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, name text NOT NULL, contact text NOT NULL, item text NOT NULL, message text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'nouveau', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.support_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, name text NOT NULL, contact text NOT NULL DEFAULT '', message text NOT NULL, is_read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT ON public.site_content, public.links, public.media, public.services, public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content, public.links, public.media, public.services, public.products, public.orders, public.support_messages TO authenticated;
GRANT INSERT ON public.orders, public.support_messages TO anon;
GRANT ALL ON public.site_content, public.links, public.media, public.services, public.products, public.orders, public.support_messages TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.site_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public read" ON public.links FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public read" ON public.media FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public read" ON public.services FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "anyone can order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "admin read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "admin delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "anyone can write support" ON public.support_messages FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "admin read support" ON public.support_messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin update support" ON public.support_messages FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "admin delete support" ON public.support_messages FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

INSERT INTO public.site_content (key, value) VALUES
('name','Christeveste Blaise'),
('tagline','Technicien numérique polyvalent · Jacmel'),
('bio','Professionnel polyvalent et technicien numérique basé à Jacmel, doté d''une forte capacité d''adaptation et d''une rigueur à toute épreuve. Qu''il s''agisse de résoudre des problèmes techniques complexes sur smartphone, de dynamiser votre présence en ligne, de créer des visuels percutants ou d''assurer des missions logistiques, je m''engage pleinement et ne baisse jamais les bras face aux défis.'),
('avatar_url',''),
('softskills','Détermination absolue : je ne m''avoue jamais vaincu et je vais toujours au bout des projets confiés.
Polyvalence : capacité à jongler entre des tâches techniques, créatives et physiques avec la même efficacité.');

INSERT INTO public.services (category, title, description, position) VALUES
('Téléphonie & Maintenance','Bypass & FRP','Contournement de sécurité, déblocage et réinitialisation de comptes sur appareils mobiles.',1),
('Téléphonie & Maintenance','Création et gestion de comptes','Création et acquisition sécurisée de comptes Google (Gmail) et iCloud.',2),
('Téléphonie & Maintenance','Dépannage informatique & numérique','Résolution de bugs, assistance technique et résolution de problèmes du quotidien.',3),
('Contenu & IA','Design graphique','Création de flyers professionnels et de cartes de visite virtuelles.',4),
('Contenu & IA','Montage & IA','Édition vidéo et génération de vidéos assistées par intelligence artificielle.',5),
('Numérique & Web','Bots WhatsApp','Automatisation de messages, de services clients ou de réponses automatiques.',6),
('Numérique & Web','Assistanat en ligne','Traitement de texte, gestion administrative à distance.',7),
('Numérique & Web','Achat en ligne','Achats sécurisés sur Internet pour le compte de tiers.',8),
('Commerce & Marketing','Gestion des ventes','Expérience dans la vente et la relation client.',9),
('Commerce & Marketing','Marketing & monétisation','Stratégies pour accroître la visibilité en ligne et générer des revenus sur les réseaux sociaux.',10),
('Commerce & Marketing','Cryptomonnaies','Connaissance et manipulation de base dans l''univers crypto.',11),
('Logistique & Terrain','Livraison & transport','Livraisons rapides et sécurisées à moto à Jacmel et ses environs.',12);