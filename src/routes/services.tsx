import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, useTable } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DynamicFields, missingCheckbox, toAnswers, type FormField } from "@/lib/forms";
import { toast } from "sonner";
import { db } from "@/lib/site";

export const Route = createFileRoute("/services")({ 
  head: () => ({
    meta: [
      { title: "Services — Christechnologie" },
      { name: "description", content: "Services techniques et numériques : déblocage IMEI, bots WhatsApp, marketing digital, etc." },
    ],
  }),
  component: ServicesPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Service = any;

function ServicesPage() {
  const { data: services = [] } = useTable<Service>("services");
  const { session } = useSession();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [contact, setContact] = useState(session?.user.email ?? "");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  const cats = Array.from(new Set(services.map((s: Service) => s.category)));

  const handleRequest = (service: Service) => {
    setSelectedService(service);
    setValues({});
    setOrderOpen(true);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    const fields: FormField[] = selectedService.form_fields ?? [];
    const miss = missingCheckbox(fields, values);
    if (miss) {
      toast.error(`Répondez à : ${miss.label}`);
      return;
    }
    setBusy(true);
    const { error } = await db.from("orders").insert({
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
      item: selectedService.title,
      quantity: 1,
      user_id: session?.user.id ?? null,
      payment_ref: "",
      answers: toAnswers(fields, values),
    });
    setBusy(false);
    if (error) {
      toast.error("Erreur lors de la demande");
      return;
    }
    toast.success("Demande envoyée ! Nous vous recontactons bientôt.");
    setOrderOpen(false);
    setName("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-hero pb-20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link to="/" className="text-sm text-primary hover:underline mb-4 inline-block">← Retour</Link>
          <h1 className="font-display text-3xl font-bold">Services</h1>
          <p className="mt-2 text-muted-foreground">Services techniques et numériques professionnels</p>
        </div>
      </header>

      {/* Services by Category */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        {cats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun service disponible pour le moment.</p>
          </div>
        ) : (
          cats.map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="font-display text-2xl font-bold mb-4 text-primary uppercase tracking-wider text-sm">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.filter((s: Service) => s.category === cat).map((s: Service) => (
                  <div key={s.id} className="flex flex-col rounded-lg border bg-card p-4 hover:border-primary transition">
                    <div className="flex justify-between gap-2 mb-2">
                      <h4 className="font-display font-bold flex-1">{s.title}</h4>
                      {s.price && <span className="text-sm text-accent font-semibold">{s.price}</span>}
                    </div>
                    <p className="flex-1 text-sm text-muted-foreground mb-4">{s.description}</p>
                    <Button size="sm" variant="secondary" onClick={() => handleRequest(s)}>Demander</Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Request Dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedService?.title}</DialogTitle>
            {selectedService?.price && <p className="text-sm text-accent">{selectedService.price}</p>}
          </DialogHeader>
          <form onSubmit={submitRequest} className="space-y-4">
            <Input required maxLength={100} placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
            <Input required maxLength={150} placeholder="Email ou WhatsApp" value={contact} onChange={(e) => setContact(e.target.value)} />
            <DynamicFields fields={selectedService?.form_fields ?? []} values={values} onChange={setValues} />
            <Textarea rows={4} maxLength={2000} placeholder="Détails de votre demande" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Envoi..." : "Envoyer la demande"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
