import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, ShoppingBag, ExternalLink, User, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db, useContent, useSession, useTable } from "@/lib/site";
import { DynamicFields, missingCheckbox, toAnswers, type FormField } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Christechnologie — Services numériques & techniques à Jacmel" },
      { name: "description", content: "Téléphonie, design, bots WhatsApp, marketing et livraison à Jacmel. Découvrez nos services." },
      { property: "og:title", content: "Christechnologie — Services numériques & techniques à Jacmel" },
      { property: "og:description", content: "Téléphonie, design, bots WhatsApp, marketing et livraison à Jacmel." },
    ],
  }),
  component: Home,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;

function Home() {
  const { content } = useContent();
  const { data: links = [] } = useTable<Item>("links");
  const { data: media = [] } = useTable<Item>("media");
  const { data: services = [] } = useTable<Item>("services");
  const { data: products = [] } = useTable<Item>("products");
  const { session, isAdmin } = useSession();
  const [orderItem, setOrderItem] = useState<Item>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cats = Array.from(new Set(services.map((s) => s.category)));
  const featuredServices = services.slice(0, 3);
  const featuredProducts = products.slice(0, 3);
  const featuredMedia = media.slice(0, 4);

  return (
    <main className="min-h-screen bg-hero pb-28">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 pt-4 text-sm">
        <Link to="/" className="font-display text-lg font-bold text-primary">Christechnologie</Link>
        <div className="hidden gap-4 md:flex">
          <Link to="/galerie" className="text-foreground hover:text-primary">Galerie</Link>
          <Link to="/vitrine" className="text-foreground hover:text-primary">Vitrine</Link>
          <Link to="/services" className="text-foreground hover:text-primary">Services</Link>
          <Link to="/suivi" className="text-foreground hover:text-primary">Suivi</Link>
          <Link to="/course" className="text-foreground hover:text-primary">Course</Link>
          <Link to="/aide" className="text-foreground hover:text-primary">Entraide</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <Link to="/admin" className="text-primary">Admin</Link>}
          {session ? (
            <>
              <Link to="/mon-compte" className="text-foreground hover:text-primary">Compte</Link>
              <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground">Déconnexion</button>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-1 text-foreground hover:text-primary"><User className="h-4 w-4" />Connexion</Link>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden">
          <div className="space-y-2">
            <Link to="/galerie" className="block px-3 py-2 text-foreground hover:text-primary">Galerie</Link>
            <Link to="/vitrine" className="block px-3 py-2 text-foreground hover:text-primary">Vitrine</Link>
            <Link to="/services" className="block px-3 py-2 text-foreground hover:text-primary">Services</Link>
            <Link to="/suivi" className="block px-3 py-2 text-foreground hover:text-primary">Suivi Colis</Link>
            <Link to="/course" className="block px-3 py-2 text-foreground hover:text-primary">Course Locale</Link>
            <Link to="/aide" className="block px-3 py-2 text-foreground hover:text-primary">Entraide</Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-12 text-center">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-primary shadow-glow bg-card">
          {content.avatar_url ? (
            <img src={content.avatar_url} alt="Logo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-3xl font-bold text-primary">C</div>
          )}
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold md:text-5xl">{content.name || "Christechnologie"}</h1>
        <p className="mt-2 text-lg text-accent">{content.tagline || "Services numériques & techniques à Jacmel"}</p>
        <p className="mt-4 mx-auto max-w-2xl text-foreground leading-relaxed">{content.bio || "Solutions numériques innovantes pour votre entreprise et votre vie quotidienne."}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((l) => (
            <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 font-medium text-sm transition hover:border-primary hover:text-primary">
              {l.label}<ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </section>

      {/* Galerie Preview */}
      {featuredMedia.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Galerie</h2>
            <Link to="/galerie" className="text-sm text-primary hover:underline">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredMedia.map((m) => (
              <figure key={m.id} className="overflow-hidden rounded-lg border bg-card hover:border-primary transition">
                {m.kind === "video" ? (
                  <video src={m.url} className="aspect-square w-full object-cover" />
                ) : (
                  <img src={m.url} alt={m.caption} className="aspect-square w-full object-cover" loading="lazy" />
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Services Preview */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Services Principaux</h2>
          <Link to="/services" className="text-sm text-primary hover:underline">Voir tous les services →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {featuredServices.map((s) => (
            <div key={s.id} className="flex flex-col rounded-lg border bg-card p-4 hover:border-primary transition">
              <div className="flex justify-between gap-2">
                <h4 className="font-display font-bold text-sm">{s.title}</h4>
                {s.price && <span className="text-xs text-accent">{s.price}</span>}
              </div>
              <p className="mt-2 flex-1 text-xs text-muted-foreground">{s.description}</p>
              <Button size="sm" variant="secondary" className="mt-4 self-start" onClick={() => setOrderItem(s)}>Demander</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Vitrine Preview */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Vitrine</h2>
            <Link to="/vitrine" className="text-sm text-primary hover:underline">Voir tous les produits →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {featuredProducts.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-lg border bg-card hover:border-primary transition">
                {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />}
                <div className="flex flex-1 flex-col p-3">
                  <span className="self-start rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">{p.kind === "physique" ? "Physique" : "Numérique"}</span>
                  <h4 className="mt-1 font-display text-sm font-bold">{p.name}</h4>
                  <p className="text-xs text-accent">{p.price}</p>
                  <Button size="sm" className="mt-3" onClick={() => setOrderItem({ ...p, title: p.name, isProduct: true })}><ShoppingBag className="h-3 w-3" />Acheter</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Distinctions */}
      {content.softskills && (
        <section className="mx-auto mt-16 max-w-7xl px-4">
          <h2 className="font-display text-2xl font-bold mb-6">Ce qui nous distingue</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {content.softskills.split("\n").filter(Boolean).map((l: string, i: number) => (
              <div key={i} className="rounded-lg border bg-card p-4 text-sm text-foreground">{l}</div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mx-auto mt-16 max-w-7xl px-4 text-center">
        <div className="rounded-2xl border bg-card/50 p-8">
          <h2 className="font-display text-2xl font-bold">Besoin d'aide ?</h2>
          <p className="mt-2 text-muted-foreground">Contactez-nous directement via le support en direct.</p>
          <Button size="lg" className="mt-6" onClick={() => setSupportOpen(true)}>Ouvrir le chat</Button>
        </div>
      </section>

      {/* Floating Support Button */}
      <button onClick={() => setSupportOpen(true)} aria-label="Support"
        className="fixed bottom-24 right-5 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground shadow-glow hover:shadow-lg transition">
        <MessageCircle className="h-5 w-5" />Support
      </button>

      {/* Bottom Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-card md:hidden">
        <div className="flex justify-around">
          <Link to="/" className="flex flex-col items-center gap-1 px-3 py-3 text-xs text-foreground hover:text-primary">📍 Accueil</Link>
          <Link to="/galerie" className="flex flex-col items-center gap-1 px-3 py-3 text-xs text-foreground hover:text-primary">🖼️ Galerie</Link>
          <Link to="/vitrine" className="flex flex-col items-center gap-1 px-3 py-3 text-xs text-foreground hover:text-primary">🛍️ Vitrine</Link>
          <Link to="/services" className="flex flex-col items-center gap-1 px-3 py-3 text-xs text-foreground hover:text-primary">⚙️ Services</Link>
          <Link to="/suivi" className="flex flex-col items-center gap-1 px-3 py-3 text-xs text-foreground hover:text-primary">📦 Suivi</Link>
        </div>
      </nav>

      {/* Dialogs */}
      <RequestDialog key={orderItem?.id ?? "none"} open={!!orderItem} onClose={() => setOrderItem(null)} item={orderItem}
        userId={session?.user.id} email={session?.user.email} paymentInfo={content.payment_info} />
      <RequestDialog key="support" open={supportOpen} onClose={() => setSupportOpen(false)} item={null}
        userId={session?.user.id} email={session?.user.email} />
    </main>
  );
}

function RequestDialog({ open, onClose, item, userId, email, paymentInfo }: {
  open: boolean; onClose: () => void; item: Item; userId?: string | undefined; email?: string | undefined; paymentInfo?: string | undefined;
}) {
  const fields: FormField[] = item?.form_fields ?? [];
  const isProduct = !!item?.isProduct;
  const pay = item ? (item.payment_info || paymentInfo || "") : "";
  const [name, setName] = useState("");
  const [contact, setContact] = useState(email ?? "");
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [ref, setRef] = useState("");
  const [values, setValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const miss = missingCheckbox(fields, values);
    if (miss) { toast.error(`Répondez à : ${miss.label}`); return; }
    setBusy(true);
    const base = { name: name.trim(), contact: contact.trim(), message: message.trim(), user_id: userId ?? null };
    const { error } = item
      ? await db.from("orders").insert({ ...base, item: item.title, quantity: qty, payment_ref: ref.trim(), answers: toAnswers(fields, values) })
      : await db.from("support_messages").insert(base);
    setBusy(false);
    if (error) { toast.error("Erreur, réessayez"); return; }
    toast.success("Envoyé ! Nous vous recontactons bientôt.");
    onClose();
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{item ? item.title : "Contacter le support"}</DialogTitle>
          {item?.price && <p className="text-accent">{item.price}</p>}
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input required maxLength={100} placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
          <Input required maxLength={150} placeholder="Téléphone / WhatsApp / email" value={contact} onChange={(e) => setContact(e.target.value)} />
          {isProduct && (
            <label className="block space-y-1"><span className="text-sm font-medium">Quantité</span>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            </label>
          )}
          <DynamicFields fields={fields} values={values} onChange={setValues} />
          <Textarea rows={4} required={!item} maxLength={2000} placeholder={item ? "Précisions (optionnel)" : "Votre message"} value={message} onChange={(e) => setMessage(e.target.value)} />
          {item && pay && (
            <div className="space-y-2 rounded-lg border border-primary/40 bg-secondary p-3">
              <p className="text-sm font-medium text-primary">Paiement manuel</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{pay}</p>
              <Input maxLength={150} placeholder="Référence / ID de transaction (si déjà payé)" value={ref} onChange={(e) => setRef(e.target.value)} />
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{item ? "Envoyer la commande" : "Envoyer"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
