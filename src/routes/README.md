import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTable } from "@/lib/site";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Christechnologie` },
      { name: "description", content: `Page dynamique ${params.slug}.` },
    ],
  }),
  component: DynamicPage,
});

function DynamicPage() {
  const { slug } = Route.useParams();
  const { data: pages = [] } = useTable<any>("custom_pages");

  const page = useMemo(() => pages.find((p: any) => p.slug === slug), [pages, slug]);

  if (!page) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-2xl border bg-card p-8">
          <h1 className="font-display text-2xl font-bold">Page introuvable</h1>
          <Link to="/" className="mt-6 inline-block text-primary">Retour à l'accueil</Link>
        </div>
      </main>
    );
  }

  const contentData = page.content_data ? JSON.parse(page.content_data) : {};

  return (
    <main className="min-h-screen bg-hero pb-20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Link to="/" className="mb-4 inline-block text-sm text-primary hover:underline">← Retour</Link>
          <h1 className="font-display text-3xl font-bold">{page.title}</h1>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        {page.content_type === "iframe" && (
          <iframe src={contentData.url} title={page.title} className="h-[80vh] w-full rounded-2xl border" />
        )}

        {page.content_type === "youtube" && (
          <div className="overflow-hidden rounded-2xl border bg-card p-3">
            <iframe
              src={`https://www.youtube.com/embed/${contentData.video_id || contentData.id || ""}`}
              title={page.title}
              className="aspect-video w-full rounded-xl"
              allowFullScreen
            />
          </div>
        )}

        {page.content_type === "html" && (
          <div className="rounded-2xl border bg-card p-6" dangerouslySetInnerHTML={{ __html: contentData.html || contentData.text || "" }} />
        )}

        {page.content_type === "whatsapp_bot" && (
          <div className="rounded-2xl border bg-card p-6 text-center">
            <a href={contentData.url || "https://wa.me/"} target="_blank" rel="noreferrer" className="inline-block rounded-lg bg-primary px-5 py-3 text-primary-foreground">Ouvrir le bot WhatsApp</a>
          </div>
        )}

        {page.content_type === "form" && (
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-muted-foreground">Formulaire de page CMS</p>
            <div className="mt-4 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              {contentData.text || "Le formulaire est prêt à être configuré depuis l’admin."}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
