import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Christeveste Blaise" },
      { name: "description", content: "Connectez-vous ou créez un compte." },
      { property: "og:title", content: "Connexion — Christeveste Blaise" },
      { property: "og:description", content: "Connectez-vous ou créez un compte." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (res.error) {
      toast.error(mode === "login" ? "Identifiants incorrects" : res.error.message);
      return;
    }
    if (!res.data.session) {
      toast.error("Impossible de se connecter");
      return;
    }
    nav({ to: res.data.session.user.email === ADMIN_EMAIL ? "/admin" : "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6">
        <h1 className="font-display text-2xl font-bold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" className="w-full" disabled={busy}>
          {mode === "login" ? "Se connecter" : "Créer le compte"}
        </Button>
        <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Créer un compte" : "J'ai déjà un compte"}
        </button>
        <Link to="/" className="block text-center text-sm text-primary">← Retour</Link>
      </form>
    </main>
  );
}
