import { createFileRoute, Link } from "@tanstack/react-router";
import { useTable } from "@/lib/site";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Christechnologie` },
      { name: "description", content: `Page ${params.slug} de Christechnologie.` },
      { property: "og:title", content: `${params.slug} — Christechnologie` },
      { property: "og:description", content: `Page ${params.slug} de Christechnologie.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DynamicPage,
});

type PD = { video_id?: string; id?: string; url?: string; html?: string; text?: string };
function parse(s: string): PD {
  try { return JSON.parse(s || "{}"); } catch { return { html: s, url: s }; }
}

function DynamicPage() {
  const { slug } = Route.useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pages = [], isLoading } = useTable<any>("custom_pages");
  const page = pages.find((p) => p.slug === slug);

  if (isLoading) return <main className="min-h-screen" />;
  if (!page) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="rounded-2xl border bg-card p-8">
          <h1 className="font-display text-2xl font-bold">Page introuvable</h1>
          <Link to="/" className="mt-6 inline-block text-primary">Retour à l'accueil</Link>
        </div>
      </main>
    );
  }
  const d = parse(page.content_data);
  const yt = (d.video_id || d.id || "").replace(/.*(?:v=|youtu\.be\/)/, "").split("&")[0];

  return (
    <main className="min-h-screen bg-hero pb-20">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/" className="text-sm text-primary hover:underline">← Retour</Link>
        <h1 className="mt-4 font-display text-3xl font-bold">{page.title}</h1>
        <div className="mt-6">
          {page.content_type === "iframe" && <iframe src={d.url} title={page.title} className="h-[80vh] w-full rounded-2xl border" />}
          {page.content_type === "youtube" && (
            <iframe src={`https://www.youtube.com/embed/${yt}`} title={page.title} className="aspect-video w-full rounded-2xl border" allowFullScreen />
          )}
          {(page.content_type === "html" || page.content_type === "form") && (
            <div className="prose prose-invert max-w-none rounded-2xl border bg-card p-6" dangerouslySetInnerHTML={{ __html: d.html || d.text || "" }} />
          )}
          {page.content_type === "whatsapp_bot" && (
            <div className="rounded-2xl border bg-card p-6 text-center">
              <a href={d.url || "https://wa.me/"} target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-primary px-5 py-3 text-primary-foreground">Ouvrir le bot WhatsApp</a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
