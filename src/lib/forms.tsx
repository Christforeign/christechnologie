/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Trash2, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type FieldType = "text" | "textarea" | "number" | "email" | "phone" | "date" | "checkbox" | "select" | "radio";
export type FormField = { id: string; label: string; type: FieldType; required: boolean; options: string };

export const FIELD_TYPES: { v: FieldType; l: string }[] = [
  { v: "text", l: "Texte court" },
  { v: "textarea", l: "Texte long" },
  { v: "number", l: "Nombre" },
  { v: "email", l: "Email" },
  { v: "phone", l: "Téléphone" },
  { v: "date", l: "Date" },
  { v: "checkbox", l: "Cases à cocher" },
  { v: "radio", l: "Choix unique" },
  { v: "select", l: "Liste déroulante" },
];

const needsOptions = (t: FieldType) => t === "checkbox" || t === "select" || t === "radio";
const opts = (s: string) => s.split(",").map((o) => o.trim()).filter(Boolean);

export function FormBuilder({ value, onChange }: { value: FormField[]; onChange: (v: FormField[]) => void }) {
  const set = (i: number, patch: Partial<FormField>) => onChange(value.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <p className="text-sm font-medium">Questions du formulaire</p>
      {value.map((f, i) => (
        <div key={f.id} className="space-y-2 rounded-md bg-secondary p-2">
          <div className="flex gap-2">
            <Input placeholder="Question" value={f.label} onChange={(e) => set(i, { label: e.target.value })} />
            <select value={f.type} onChange={(e) => set(i, { type: e.target.value as FieldType })} className="rounded-md border bg-background px-2 text-sm">
              {FIELD_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          {needsOptions(f.type) && (
            <Input placeholder="Options séparées par des virgules" value={f.options} onChange={(e) => set(i, { options: e.target.value })} />
          )}
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={f.required} onChange={(e) => set(i, { required: e.target.checked })} />Obligatoire
            </label>
            {i > 0 && (
              <button type="button" onClick={() => { const v = [...value]; [v[i - 1], v[i]] = [v[i], v[i - 1]]; onChange(v); }}>
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
            <button type="button" className="ml-auto text-destructive" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary"
        onClick={() => onChange([...value, { id: crypto.randomUUID(), label: "", type: "text", required: false, options: "" }])}>
        <Plus className="h-4 w-4" />Ajouter une question
      </Button>
    </div>
  );
}

export function DynamicFields({ fields, values, onChange }: {
  fields: FormField[]; values: Record<string, any>; onChange: (v: Record<string, any>) => void;
}) {
  return (
    <>
      {fields.filter((f) => f.label).map((f) => {
        const v = values[f.id];
        const set = (x: any) => onChange({ ...values, [f.id]: x });
        const label = <span className="text-sm font-medium">{f.label}{f.required && " *"}</span>;
        if (f.type === "checkbox") {
          const arr: string[] = v ?? [];
          return (
            <fieldset key={f.id} className="space-y-1">{label}
              {opts(f.options).map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={arr.includes(o)} onChange={(e) => set(e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))} />{o}
                </label>
              ))}
            </fieldset>
          );
        }
        if (f.type === "radio") {
          return (
            <fieldset key={f.id} className="space-y-1">{label}
              {opts(f.options).map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={f.id} required={f.required} checked={v === o} onChange={() => set(o)} />{o}
                </label>
              ))}
            </fieldset>
          );
        }
        return (
          <label key={f.id} className="block space-y-1">{label}
            {f.type === "textarea" ? (
              <Textarea required={f.required} value={v ?? ""} onChange={(e) => set(e.target.value)} />
            ) : f.type === "select" ? (
              <select required={f.required} value={v ?? ""} onChange={(e) => set(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">— Choisir —</option>
                {opts(f.options).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <Input required={f.required} value={v ?? ""} onChange={(e) => set(e.target.value)}
                type={f.type === "phone" ? "tel" : f.type === "textarea" ? "text" : f.type} />
            )}
          </label>
        );
      })}
    </>
  );
}

export function toAnswers(fields: FormField[], values: Record<string, any>) {
  return fields.filter((f) => f.label).map((f) => ({
    label: f.label,
    value: Array.isArray(values[f.id]) ? values[f.id].join(", ") : String(values[f.id] ?? ""),
  }));
}

export function missingCheckbox(fields: FormField[], values: Record<string, any>) {
  return fields.find((f) => f.type === "checkbox" && f.required && !(values[f.id]?.length));
}
