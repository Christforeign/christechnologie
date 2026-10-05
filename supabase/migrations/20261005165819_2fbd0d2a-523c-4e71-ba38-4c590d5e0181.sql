ALTER TABLE public.services ADD COLUMN form_fields jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN form_fields jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN kind text NOT NULL DEFAULT 'numerique';
ALTER TABLE public.products ADD COLUMN payment_info text NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN answers jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN quantity int NOT NULL DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN payment_ref text NOT NULL DEFAULT '';
INSERT INTO public.site_content (key, value) VALUES ('payment_info', 'Paiement manuel : MonCash / NatCash au +509 XXXX XXXX. Envoyez la référence de transaction dans le formulaire.') ON CONFLICT DO NOTHING;