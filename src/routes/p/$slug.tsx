import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { db, useSession } from "@/lib/site";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Mon compte — Christechnologie" },
      { name: "description", content: "Historique de commandes, portefeuille et suivi client." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
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
          <h1 className="font-display text-3xl font-bold">Mon compte</h1>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-2xl font-bold">Portefeuille</h2>
          <div className="mt-4 rounded-xl bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Solde virtuel</p>
            <p className="text-3xl font-bold text-primary">0,00 USD</p>
          </div>
        </div>
      </section>
    </main>
  );
}
