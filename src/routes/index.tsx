import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, ShoppingBag, ExternalLink, User } from "lucide-react";
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
      { title: "Christeveste Blaise — Technicien numérique à Jacmel" },
      { name: "description", content: "Téléphonie, design, bots WhatsApp, marketing et livraison à Jacmel. Commandez un service." },
      { property: "og:title", content: "Christeveste Blaise — Technicien numérique à Jacmel" },
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

  const cats = Array.from(new Set(services.map((s) => s.category)));

  return (
    <main className="min-h-screen bg-hero pb-28">
      <header className="mx-auto flex max-w-3xl justify-end gap-2 px-4 pt-4 text-sm">
        {isAdmin && <Link to="/admin" className="text-primary">Admin</Link>}
        {session ? (
          <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground">Déconnexion</button>
        ) : (
          <Link to="/auth" className="flex items-center gap-1 text-muted-foreground"><User className="h-4 w-4" />Connexion</Link>
        )}
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-8 text-center">
        <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-primary shadow-glow bg-card">
          {content.avatar_url ? (
            <img src={content.avatar_url} alt={content.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-4xl font-bold text-primary">
              {(content.name || "C")[0]}
            </div>
          )}
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold">{content.name}</h1>
        <p className="mt-2 text-accent">{content.tagline}</p>
        <p className="mt-5 text-muted-foreground leading-relaxed">{content.bio}</p>

        <div className="mt-6 space-y-3">
          {links.map((l) => (
            <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 font-medium transition hover:border-primary">
              {l.label}<ExternalLink className="h-4 w-4 text-primary" />
            </a>
          ))}
        </div>
      </section>

      {media.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <h2 className="font-display text-2xl font-bold">Galerie</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <figure key={m.id} className="overflow-hidden rounded-xl border bg-card">
                {m.kind === "video" ? (
                  <video src={m.url} controls className="aspect-square w-full object-cover" />
                ) : (
                  <img src={m.url} alt={m.caption} className="aspect-square w-full object-cover" loading="lazy" />
                )}
                {m.caption && <figcaption className="p-2 text-xs text-muted-foreground">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-14 max-w-3xl px-4">
        <h2 className="font-display text-2xl font-bold">Services</h2>
        {cats.map((c) => (
          <div key={c} className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">{c}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {services.filter((s) => s.category === c).map((s) => (
                <div key={s.id} className="flex flex-col rounded-xl border bg-card p-4">
                  <div className="flex justify-between gap-2">
                    <h4 className="font-display font-bold">{s.title}</h4>
                    {s.price && <span className="text-sm text-accent">{s.price}</span>}
                  </div>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.description}</p>
                  <Button size="sm" variant="secondary" className="mt-3 self-start" onClick={() => setOrderItem(s)}>Demander</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {(
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <h2 className="font-display text-2xl font-bold">Vitrine</h2>
          {products.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Bientôt de nouveaux produits.</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-xl border bg-card">
                {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />}
                <div className="flex flex-1 flex-col p-3">
                  <span className="self-start rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">{p.kind === "physique" ? "Physique" : "Numérique"}</span>
                  <h4 className="mt-1 font-display font-bold">{p.name}</h4>
                  <p className="text-sm text-accent">{p.price}</p>
                  <p className="mt-1 flex-1 text-xs text-muted-foreground">{p.description}</p>
                  <Button size="sm" className="mt-3" onClick={() => setOrderItem({ ...p, title: p.name, isProduct: true })}><ShoppingBag className="h-4 w-4" />Acheter</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.softskills && (
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <h2 className="font-display text-2xl font-bold">Ce qui me distingue</h2>
          <ul className="mt-4 space-y-2">
            {content.softskills.split("\n").filter(Boolean).map((l: string, i: number) => (
              <li key={i} className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{l}</li>
            ))}
          </ul>
        </section>
      )}

      <button onClick={() => setSupportOpen(true)} aria-label="Support"
        className="fixed bottom-5 right-5 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground shadow-glow">
        <MessageCircle className="h-5 w-5" />Support
      </button>

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
    toast.success("Envoyé ! Je vous recontacte bientôt.");
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
            <div className="space-y-2 rounded-xl border border-primary/40 bg-secondary p-3">
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
