import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { db, useSession } from "@/lib/site";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Entraide — Christechnologie" },
      { name: "description", content: "Page d’entraide et de demande d’aide pour les personnes en difficulté." },
    ],
  }),
  component: AidePage,
});

function AidePage() {
  const { session } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(session?.user.email ?? "");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await db.from("support_messages").insert({
      name: name.trim(),
      contact: phone.trim(),
      message: details.trim(),
      user_id: session?.user.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Erreur lors de l’envoi");
      return;
    }
    toast.success("Demande enregistrée. Nous vous aidons rapidement.");
    setName("");
    setPhone(session?.user.email ?? "");
    setDetails("");
  };

  return (
    <main className="min-h-screen bg-hero pb-20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link to="/" className="mb-4 inline-block text-sm text-primary hover:underline">← Retour</Link>
          <h1 className="font-display text-3xl font-bold">Entraide & Demande d’aide</h1>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-2xl font-bold">Notre mission</h2>
              <p className="mt-3 text-muted-foreground">Nous offrons un espace solidaire pour les personnes en difficulté, avec des dispositifs de soutien humanitaire et de sensibilisation.</p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-display text-xl font-bold">Formulaire d’aide</h3>
              <form onSubmit={submit} className="mt-4 space-y-4">
                <Input placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input placeholder="Téléphone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <Textarea rows={5} placeholder="Décrivez votre besoin ou votre situation" value={details} onChange={(e) => setDetails(e.target.value)} required />
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Envoi..." : "Soumettre la demande"}</Button>
              </form>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display text-xl font-bold">Publicités</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-dashed p-3">Bannière sponsorisée haut — AdSense ID: ca-pub-xxxxxx</div>
                <div className="rounded-lg border border-dashed p-3">Bannière milieu — campagne sponsor</div>
                <div className="rounded-lg border border-dashed p-3">Bannière bas — partenaire</div>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display text-xl font-bold">Liens utiles</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Partenaires solidaires</li>
                <li>• Questions fréquentes</li>
                <li>• Ressources locales</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
