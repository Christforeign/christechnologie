import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, ShoppingBag, ExternalLink, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db, useContent, useSession, useTable } from "@/lib/site";
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

type Item = { id: string; [k: string]: any };

function Home() {
  const { content } = useContent();
  const { data: links = [] } = useTable<Item>("links");
  const { data: media = [] } = useTable<Item>("media");
  const { data: services = [] } = useTable<Item>("services");
  const { data: products = [] } = useTable<Item>("products");
  const { session, isAdmin } = useSession();
  const [orderItem, setOrderItem] = useState<string | null>(null);
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
                  <Button size="sm" variant="secondary" className="mt-3 self-start" onClick={() => setOrderItem(s.title)}>Demander</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {products.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl px-4">
          <h2 className="font-display text-2xl font-bold">Vitrine</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-xl border bg-card">
                {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />}
                <div className="flex flex-1 flex-col p-3">
                  <h4 className="font-display font-bold">{p.name}</h4>
                  <p className="text-sm text-accent">{p.price}</p>
                  <p className="mt-1 flex-1 text-xs text-muted-foreground">{p.description}</p>
                  <Button size="sm" className="mt-3" onClick={() => setOrderItem(p.name)}><ShoppingBag className="h-4 w-4" />Acheter</Button>
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
            {content.softskills.split("\n").filter(Boolean).map((l, i) => (
              <li key={i} className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{l}</li>
            ))}
          </ul>
        </section>
      )}

      <button onClick={() => setSupportOpen(true)} aria-label="Support"
        className="fixed bottom-5 right-5 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground shadow-glow">
        <MessageCircle className="h-5 w-5" />Support
      </button>

      <RequestDialog open={!!orderItem} onClose={() => setOrderItem(null)} title={`Commande : ${orderItem ?? ""}`}
        userId={session?.user.id} email={session?.user.email}
        onSend={(f) => db.from("orders").insert({ ...f, item: orderItem })} />
      <RequestDialog open={supportOpen} onClose={() => setSupportOpen(false)} title="Contacter le support"
        userId={session?.user.id} email={session?.user.email}
        onSend={(f) => db.from("support_messages").insert(f)} />
    </main>
  );
}

function RequestDialog({ open, onClose, title, onSend, userId, email }: {
  open: boolean; onClose: () => void; title: string; userId?: string; email?: string;
  onSend: (f: { name: string; contact: string; message: string; user_id: string | null }) => PromiseLike<{ error: any }>;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState(email ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await onSend({ name: name.trim(), contact: contact.trim(), message: message.trim(), user_id: userId ?? null });
    setBusy(false);
    if (error) return toast.error("Erreur, réessayez");
    toast.success("Envoyé ! Je vous recontacte bientôt.");
    setMessage("");
    onClose();
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input required maxLength={100} placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
          <Input required maxLength={150} placeholder="Téléphone / WhatsApp / email" value={contact} onChange={(e) => setContact(e.target.value)} />
          <Textarea required maxLength={2000} placeholder="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type="submit" className="w-full" disabled={busy}>Envoyer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
