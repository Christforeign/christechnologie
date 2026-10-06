import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { db, useSession, useTable } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/suivi")({
  head: () => ({
    meta: [
      { title: "Suivi de colis — Christechnologie" },
      { name: "description", content: "Suivez l'état de votre colis ou commande avec votre numéro de suivi." },
      { property: "og:title", content: "Suivi de colis — Christechnologie" },
      { property: "og:description", content: "Entrez votre numéro de suivi pour voir où se trouve votre colis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingPage,
});

const STEPS = ["en_attente", "en_transit", "arrive_point_relais", "livre"];
const LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_transit: "En transit",
  arrive_point_relais: "Arrivé au point relais",
  livre: "Livré",
};

type Ship = { tracking_number: string; product: string; destination: string; status: string; status_notes: string; updated_at: string };

function Timeline({ s }: { s: Ship }) {
  const idx = STEPS.indexOf(s.status);
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-lg font-bold">{s.tracking_number}</p>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">{LABELS[s.status] ?? s.status}</span>
      </div>
      {s.product && <p className="mt-1 text-sm text-muted-foreground">{s.product}{s.destination ? ` → ${s.destination}` : ""}</p>}
      <ol className="mt-4 space-y-3">
        {STEPS.map((st, i) => (
          <li key={st} className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
            <span className={i <= idx ? "" : "text-muted-foreground"}>{LABELS[st]}</span>
          </li>
        ))}
      </ol>
      {s.status_notes && <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">{s.status_notes}</p>}
      <p className="mt-2 text-xs text-muted-foreground">Mis à jour : {new Date(s.updated_at).toLocaleString("fr-FR")}</p>
    </div>
  );
}

function TrackingPage() {
  const { session } = useSession();
  const { data: mine = [] } = useTable<Ship>("shipments");
  const [code, setCode] = useState("");
  const [found, setFound] = useState<Ship | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const { data, error } = await db.rpc("track_shipment", { _code: code });
    setLoading(false);
    const row = Array.isArray(data) ? data[0] : null;
    if (error || !row) { setFound(null); toast.error("Aucun colis trouvé avec ce numéro"); return; }
    setFound(row as Ship);
  };

  return (
    <main className="min-h-screen bg-hero pb-20">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="text-sm text-primary hover:underline">← Retour</Link>
        <h1 className="mt-4 flex items-center gap-2 font-display text-3xl font-bold"><Package /> Suivi de colis</h1>
        <form onSubmit={search} className="mt-6 flex gap-2">
          <Input placeholder="Numéro de suivi (ex: CHRIS-AB12CD)" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit" disabled={loading}>{loading ? "..." : "Suivre"}</Button>
        </form>
        {found && <div className="mt-6"><Timeline s={found} /></div>}
        {session && mine.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="font-display text-xl font-bold">Mes colis</h2>
            {mine.map((s) => <Timeline key={s.tracking_number} s={s} />)}
          </section>
        )}
      </div>
    </main>
  );
}
