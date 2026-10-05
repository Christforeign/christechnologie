import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db, uploadFile, useContent, useRefresh, useSession, useTable } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration" },
      { name: "description", content: "Gestion du site." },
      { property: "og:title", content: "Administration" },
      { property: "og:description", content: "Gestion du site." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = any;

function Admin() {
  const { ready, isAdmin } = useSession();
  const nav = useNavigate();
  useEffect(() => {
    if (ready && !isAdmin) nav({ to: "/auth" });
  }, [ready, isAdmin, nav]);
  if (!ready || !isAdmin) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Admin</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/" className="text-primary">Voir le site</Link>
          <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground">Déconnexion</button>
        </div>
      </div>
      <Tabs defaultValue="orders" className="mt-6">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="content">Textes</TabsTrigger>
          <TabsTrigger value="links">Liens</TabsTrigger>
          <TabsTrigger value="media">Photos/Vidéos</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="products">Vitrine</TabsTrigger>
        </TabsList>
        <TabsContent value="orders"><Inbox table="orders" /></TabsContent>
        <TabsContent value="support"><Inbox table="support_messages" /></TabsContent>
        <TabsContent value="content"><ContentEditor /></TabsContent>
        <TabsContent value="links">
          <CrudList table="links" fields={[{ k: "label", p: "Texte du lien" }, { k: "url", p: "https://..." }]} />
        </TabsContent>
        <TabsContent value="media"><MediaManager /></TabsContent>
        <TabsContent value="services">
          <CrudList table="services" fields={[{ k: "category", p: "Catégorie" }, { k: "title", p: "Titre" }, { k: "price", p: "Prix (optionnel)" }, { k: "description", p: "Description", long: true }]} />
        </TabsContent>
        <TabsContent value="products">
          <CrudList table="products" fields={[{ k: "name", p: "Nom" }, { k: "price", p: "Prix" }, { k: "description", p: "Description", long: true }, { k: "image_url", p: "Image", image: true }]} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Inbox({ table }: { table: string }) {
  const { data = [] } = useTable<Item>(table, "created_at");
  const refresh = useRefresh();
  const remove = async (id: string) => { await db.from(table).delete().eq("id", id); refresh(table); };
  const setStatus = async (id: string, status: string) => { await db.from(table).update({ status }).eq("id", id); refresh(table); };
  if (!data.length) return <p className="py-8 text-muted-foreground">Rien pour l'instant.</p>;
  return (
    <div className="space-y-3">
      {data.map((r) => (
        <div key={r.id} className="rounded-xl border bg-card p-4">
          <div className="flex justify-between gap-2 text-sm">
            <span className="font-bold">{r.name} · <span className="text-accent">{r.contact}</span></span>
            <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString("fr")}</span>
          </div>
          {r.item && <p className="mt-1 text-primary">{r.item}</p>}
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.message}</p>
          <div className="mt-3 flex gap-2">
            {table === "orders" && (
              <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="rounded-md border bg-secondary px-2 text-sm">
                <option value="nouveau">Nouveau</option><option value="en cours">En cours</option><option value="terminé">Terminé</option>
              </select>
            )}
            <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

const CONTENT_KEYS = [
  { k: "name", l: "Nom" }, { k: "tagline", l: "Slogan" }, { k: "bio", l: "Bio", long: true },
  { k: "softskills", l: "Ce qui me distingue (une ligne par point)", long: true },
];

function ContentEditor() {
  const { content } = useContent();
  const refresh = useRefresh();
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => setVals(content), [JSON.stringify(content)]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async (key: string, value: string) => {
    const { error } = await db.from("site_content").upsert({ key, value });
    if (error) toast.error(error.message); else { toast.success("Enregistré"); refresh("site_content"); }
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-2 text-sm font-medium">Photo de profil</p>
        {vals["avatar_url"] && <img src={vals["avatar_url"]} alt="" className="mb-2 h-20 w-20 rounded-full object-cover" />}
        <FilePick accept="image/*" onUrl={(u) => save("avatar_url", u)} />
      </div>
      {CONTENT_KEYS.map((f) => (
        <div key={f.k} className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-medium">{f.l}</p>
          {f.long ? (
            <Textarea rows={5} value={vals[f.k] ?? ""} onChange={(e) => setVals({ ...vals, [f.k]: e.target.value })} />
          ) : (
            <Input value={vals[f.k] ?? ""} onChange={(e) => setVals({ ...vals, [f.k]: e.target.value })} />
          )}
          <Button size="sm" className="mt-2" onClick={() => save(f.k, vals[f.k] ?? "")}>Enregistrer</Button>
        </div>
      ))}
    </div>
  );
}

function FilePick({ accept, onUrl }: { accept: string; onUrl: (url: string, file: File) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
      <Upload className="h-4 w-4" />{busy ? "Envoi..." : "Choisir un fichier"}
      <input type="file" accept={accept} className="hidden" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        setBusy(true);
        try { onUrl(await uploadFile(f), f); } catch (err: any) { toast.error(err?.message ?? "Erreur d'envoi"); }
        setBusy(false); e.target.value = "";
      }} />
    </label>
  );
}

function MediaManager() {
  const { data = [] } = useTable<Item>("media");
  const refresh = useRefresh();
  const [caption, setCaption] = useState("");
  const add = async (url: string, file: File) => {
    const kind = file.type.startsWith("video") ? "video" : "image";
    const { error } = await db.from("media").insert({ url, kind, caption, position: data.length });
    if (error) toast.error(error.message); else { setCaption(""); refresh("media"); toast.success("Ajouté"); }
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-4">
        <Input className="max-w-xs" placeholder="Légende (optionnel)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <FilePick accept="image/*,video/*" onUrl={add} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((m) => (
          <div key={m.id} className="relative overflow-hidden rounded-xl border">
            {m.kind === "video" ? <video src={m.url} className="aspect-square w-full object-cover" /> : <img src={m.url} alt="" className="aspect-square w-full object-cover" />}
            <Button size="sm" variant="destructive" className="absolute right-1 top-1" onClick={async () => { await db.from("media").delete().eq("id", m.id); refresh("media"); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

type Field = { k: string; p: string; long?: boolean; image?: boolean };

function CrudList({ table, fields }: { table: string; fields: Field[] }) {
  const { data = [] } = useTable<Item>(table);
  const refresh = useRefresh();
  const blank = Object.fromEntries(fields.map((f) => [f.k, ""]));
  const [draft, setDraft] = useState<Record<string, string>>(blank);

  const save = async (row: any) => {
    const { error } = row.id
      ? await db.from(table).update(row).eq("id", row.id)
      : await db.from(table).insert({ ...row, position: data.length + 1 });
    if (error) { toast.error(error.message); return; }
    toast.success("Enregistré"); refresh(table);
    if (!row.id) setDraft(blank);
  };
  const remove = async (id: string) => { await db.from(table).delete().eq("id", id); refresh(table); };

  return (
    <div className="space-y-3">
      <RowForm fields={fields} value={draft} onChange={setDraft} onSave={() => save(draft)} label="Ajouter" />
      {data.map((r) => <EditRow key={r.id} row={r} fields={fields} onSave={save} onDelete={() => remove(r.id)} />)}
    </div>
  );
}

function EditRow({ row, fields, onSave, onDelete }: { row: Item; fields: Field[]; onSave: (r: any) => void; onDelete: () => void }) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.k, row[f.k] ?? ""])));
  return <RowForm fields={fields} value={v} onChange={setV} onSave={() => onSave({ id: row.id, ...v })} onDelete={onDelete} label="Enregistrer" />;
}

function RowForm({ fields, value, onChange, onSave, onDelete, label }: {
  fields: Field[]; value: Record<string, string>; onChange: (v: Record<string, string>) => void; onSave: () => void; onDelete?: () => void; label: string;
}) {
  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      {fields.map((f) =>
        f.image ? (
          <div key={f.k} className="flex items-center gap-2">
            {value[f.k] && <img src={value[f.k]} alt="" className="h-12 w-12 rounded object-cover" />}
            <FilePick accept="image/*" onUrl={(u) => onChange({ ...value, [f.k]: u })} />
          </div>
        ) : f.long ? (
          <Textarea key={f.k} placeholder={f.p} value={value[f.k]} onChange={(e) => onChange({ ...value, [f.k]: e.target.value })} />
        ) : (
          <Input key={f.k} placeholder={f.p} value={value[f.k]} onChange={(e) => onChange({ ...value, [f.k]: e.target.value })} />
        ),
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave}>{label}</Button>
        {onDelete && <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}
