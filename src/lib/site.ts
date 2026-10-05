import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAIL = "blaisechristeveste@gmail.com";

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;
export { db };

export function useTable<T = any>(table: string, order = "position") {
  return useQuery<T[]>({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await db.from(table).select("*").order(order, { ascending: order !== "created_at" });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useContent() {
  const q = useTable<{ key: string; value: string }>("site_content", "key");
  const map: any = {};
  q.data?.forEach((r) => (map[r.key] = r.value));
  return { ...q, content: map };
}

export function useRefresh() {
  const qc = useQueryClient();
  return (table: string) => qc.invalidateQueries({ queryKey: [table] });
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const isAdmin = session?.user.email === ADMIN_EMAIL;
  return { session, ready, isAdmin };
}

export async function uploadFile(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2;
  return data.signedUrl;
}
