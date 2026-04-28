import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExpertCard from "@/components/ExpertCard";
import PodcastCard from "@/components/PodcastCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X } from "lucide-react";
import {
  fetchExperts,
  fetchPodcasts,
  type ExpertWithProfile,
  type PodcastWithOwner,
} from "@/lib/queries";
import { TOPICS, parseTopics } from "@/lib/topics";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explorer — PodMatch" },
      { name: "description", content: "Découvrez les experts et podcasts disponibles sur PodMatch." },
      { property: "og:title", content: "Explorer — PodMatch" },
      { property: "og:description", content: "Trouvez l'expert ou le podcast parfait." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"experts" | "podcasts">("experts");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [experts, setExperts] = useState<ExpertWithProfile[] | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastWithOwner[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [e, p] = await Promise.all([fetchExperts(), fetchPodcasts()]);
        if (!cancelled) {
          setExperts(e);
          setPodcasts(p);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredExperts = useMemo(() => {
    if (!experts) return [];
    const q = search.toLowerCase().trim();
    return experts.filter((e) => {
      const matchesQuery =
        !q ||
        e.display_name?.toLowerCase().includes(q) ||
        e.headline?.toLowerCase().includes(q) ||
        e.expertise?.toLowerCase().includes(q) ||
        e.bio?.toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (selectedTopics.length === 0) return true;
      const expertTopics = parseTopics(e.expertise).map((t) => t.toLowerCase());
      // ET logique : l'expert doit posséder TOUTES les thématiques sélectionnées
      return selectedTopics.every((t) => expertTopics.includes(t.toLowerCase()));
    });
  }, [experts, search, selectedTopics]);

  const filteredPodcasts = useMemo(() => {
    if (!podcasts) return [];
    const q = search.toLowerCase().trim();
    if (!q) return podcasts;
    return podcasts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.owner_display_name?.toLowerCase().includes(q),
    );
  }, [podcasts, search]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-3xl md:text-4xl">Explorer</h1>
            <p className="mt-2 text-muted-foreground">
              Découvrez les experts et podcasts de la communauté PodMatch.
            </p>
          </div>

          <div className="mt-8 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="mt-8">
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveTab("experts")}
                className={`inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all ${
                  activeTab === "experts" ? "bg-background text-foreground shadow" : "hover:text-foreground"
                }`}
              >
                Experts {experts && `(${filteredExperts.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("podcasts")}
                className={`inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all ${
                  activeTab === "podcasts" ? "bg-background text-foreground shadow" : "hover:text-foreground"
                }`}
              >
                Podcasts {podcasts && `(${filteredPodcasts.length})`}
              </button>
            </div>

            {activeTab === "experts" && (
            <>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Filtrer par thématique
                </h2>
                {selectedTopics.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTopics([])}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Réinitialiser ({selectedTopics.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return (
                    <Badge
                      key={topic}
                      variant={active ? "default" : "outline"}
                      onClick={() => toggleTopic(topic)}
                      className={`cursor-pointer select-none transition-colors px-3 py-1 text-xs ${
                        active
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-accent"
                      }`}
                    >
                      {topic}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="mt-6">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : filteredExperts.length === 0 ? (
                <EmptyState message={search ? "Aucun expert ne correspond à votre recherche" : "Aucun profil pour le moment"} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperts.map((e) => (
                    <ExpertCard key={e.id} expert={e} />
                  ))}
                </div>
              )}
            </div>
            </>
            )}

            {activeTab === "podcasts" && (
            <div className="mt-6">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : filteredPodcasts.length === 0 ? (
                <EmptyState message={search ? "Aucun podcast ne correspond à votre recherche" : "Aucun podcast pour le moment"} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPodcasts.map((p) => (
                    <PodcastCard key={p.id} podcast={p} />
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Chargement...
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
      <p className="text-lg">{message}</p>
      <p className="text-sm mt-1">Revenez bientôt — la communauté grandit chaque jour.</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-destructive">
      <p className="text-sm">Erreur : {message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </div>
  );
}
