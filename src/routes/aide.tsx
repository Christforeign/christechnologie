import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession, useTable } from "@/lib/site";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Suivi de colis — Christechnologie" },
      { name: "description", content: "Suivez votre colis ou votre commande en temps réel." },
    ],
  }),
  component: TrackingPage,
});

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_transit: "En transit",
  arrive_point_relais: "Arrivé au point relais",
  livre: "Livré",
};

function TrackingPage() {
  const { session } = useSession();
  const { data: shipments = [] } = useTable<any>("shipments");
  const [search, setSearch] = useState("");

  const visibleShipments = session
    ? shipments.filter((s: any) => s.client_email === session.user.email)
    : shipments.filter((s: any) => s.tracking_number?.toLowerCase().includes(search.toLowerCase()));

  const selected = visibleShipments.find((s: any) =>
    s.tracking_number?.toLowerCase() === search.trim().toLowerCase() || !search.trim()) ?? visibleShipments[0] ?? null;

  return (
    <main className="min-h-screen bg-hero pb-20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link to="/" className="mb-4 inline-block text-sm text-primary hover:underline">← Retour</Link>
          <h1 className="font-display text-3xl font-bold">Suivi de colis</h1>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input placeholder="Saisissez votre numéro de suivi" value={search} onChange={(e) => setSearch(e.target.value)} className="md:max-w-md" />
          <Button type="button" variant="secondary">Rechercher</Button>
        </div>

        {selected ? (
          <div className="mt-8 rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de suivi</p>
                <h2 className="font-display text-2xl font-bold">{selected.tracking_number}</h2>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-accent">{STATUS_LABELS[selected.status] ?? selected.status}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Client</p>
                <p className="mt-1 font-medium">{selected.client_name}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Destination</p>
                <p className="mt-1 font-medium">{selected.destination}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase text-muted-foreground">Mise à jour</p>
                <p className="mt-1 font-medium">{new Date(selected.updated_at ?? selected.created_at).toLocaleString("fr")}</p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border bg-secondary p-3">
              <p className="font-medium">{STATUS_LABELS[selected.status] ?? selected.status}</p>
              <p className="mt-1 text-sm text-muted-foreground">{selected.status_notes || "Commande enregistrée."}</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border bg-card p-6 text-center text-muted-foreground">Aucun colis trouvé pour ce numéro.</div>
        )}
      </section>
    </main>
  );
}
