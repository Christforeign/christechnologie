import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { useSession, useTable } from "@/lib/site";

export const Route = createFileRoute("/galerie")({ 
  head: () => ({
    meta: [
      { title: "Galerie — Christechnologie" },
      { name: "description", content: "Découvrez nos créations et projets en photos et vidéos." },
    ],
  }),
  component: GaleriePage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Media = any;

function GaleriePage() {
  const { data: media = [] } = useTable<Media>("media");
  const { isAdmin } = useSession();
  const [fullscreen, setFullscreen] = useState<Media | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [search, setSearch] = useState("");

  const filtered = media.filter((m: Media) => {
    const matchType = filter === "all" || m.kind === filter;
    const matchSearch = !search || m.caption?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <main className="min-h-screen bg-hero pb-20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link to="/" className="text-sm text-primary hover:underline mb-4 inline-block">← Retour</Link>
          <h1 className="font-display text-3xl font-bold">Galerie</h1>
          <p className="mt-2 text-muted-foreground">Photos et vidéos de nos réalisations</p>
        </div>
      </header>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border bg-card px-4 py-2 text-sm"
        />
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === "all" ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("image")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === "image" ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setFilter("video")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            filter === "video" ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary"
          }`}
        >
          Vidéos
        </button>
      </div>

      {/* Gallery Grid */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun contenu trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => (
              <figure key={m.id} className="group relative overflow-hidden rounded-lg border bg-card hover:border-primary transition cursor-pointer"
                onClick={() => setFullscreen(m)}>
                {m.kind === "video" ? (
                  <video src={m.url} className="aspect-square w-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <img src={m.url} alt={m.caption} className="aspect-square w-full object-cover group-hover:scale-105 transition" loading="lazy" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition">
                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
                {m.caption && <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white opacity-0 group-hover:opacity-100 transition">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setFullscreen(null)}
            className="absolute top-4 right-4 text-white hover:text-primary"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="flex flex-col items-center max-w-4xl max-h-[90vh]">
            {fullscreen.kind === "video" ? (
              <video src={fullscreen.url} controls className="w-full h-full object-contain rounded-lg" />
            ) : (
              <img src={fullscreen.url} alt={fullscreen.caption} className="w-full h-full object-contain rounded-lg" />
            )}
            {fullscreen.caption && <p className="mt-4 text-center text-white">{fullscreen.caption}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
