import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useSession, useTable } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { db } from "@/lib/site";

export const Route = createFileRoute("/vitrine")({ 
  head: () => ({
    meta: [
      { title: "Vitrine — Christechnologie" },
      { name: "description", content: "Découvrez nos produits et services disponibles à l'achat." },
    ],
  }),
  component: VitrinePage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

function VitrinePage() {
  const { data: products = [] } = useTable<Product>("products");
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "physique" | "numerique">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [contact, setContact] = useState(session?.user.email ?? "");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = products.filter((p: Product) => {
    const matchKind = kind === "all" || p.kind === kind;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchKind && matchSearch;
  });

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setOrderOpen(true);
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setBusy(true);
    const { error } = await db.from("orders").insert({
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
      item: selectedProduct.name,
      quantity: qty,
      user_id: session?.user.id ?? null,
      payment_ref: "",
      answers: [],
    });
    setBusy(false);
    if (error) {
      toast.error("Erreur lors de la commande");
      return;
    }
    toast.success("Commande envoyée ! Nous vous recontactons bientôt.");
    setOrderOpen(false);
    setName("");
    setMessage("");
    setQty(1);
  };

  return (
    <main className="min-h-screen bg-hero pb-20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link to="/" className="text-sm text-primary hover:underline mb-4 inline-block">← Retour</Link>
          <h1 className="font-display text-3xl font-bold">Vitrine</h1>
          <p className="mt-2 text-muted-foreground">Produits et services à commander</p>
        </div>
      </header>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border bg-card px-4 py-2 text-sm"
        />
        <button
          onClick={() => setKind("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            kind === "all" ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setKind("physique")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            kind === "physique" ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary"
          }`}
        >
          Physique
        </button>
        <button
          onClick={() => setKind("numerique")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            kind === "numerique" ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary"
          }`}
        >
          Numérique
        </button>
      </div>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun produit trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-lg border bg-card hover:border-primary transition">
                {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />}
                <div className="flex flex-1 flex-col p-3">
                  <span className="self-start rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">{p.kind === "physique" ? "Physique" : "Numérique"}</span>
                  <h4 className="mt-2 font-display font-bold text-sm line-clamp-2">{p.name}</h4>
                  <p className="mt-1 text-sm font-semibold text-primary">{p.price}</p>
                  <p className="mt-1 flex-1 text-xs text-muted-foreground line-clamp-3">{p.description}</p>
                  <Button size="sm" className="mt-3 w-full" onClick={() => handleOrder(p)}><ShoppingBag className="h-3 w-3" />Acheter</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order Dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitOrder} className="space-y-4">
            <Input required maxLength={100} placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
            <Input required maxLength={150} placeholder="Email ou WhatsApp" value={contact} onChange={(e) => setContact(e.target.value)} />
            <label className="block space-y-1">
              <span className="text-sm font-medium">Quantité</span>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            </label>
            <Textarea rows={3} maxLength={1000} placeholder="Message (optionnel)" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Envoi..." : "Commander"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
