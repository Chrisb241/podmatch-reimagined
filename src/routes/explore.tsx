import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExpertCard from "@/components/ExpertCard";
import PodcastCard from "@/components/PodcastCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import {
  fetchExperts,
  fetchPodcasts,
  type ExpertWithProfile,
  type PodcastWithOwner,
} from "@/lib/queries";

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
  const [experts, setExperts] = useState<ExpertWithProfile[] | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastWithOwner[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!q) return experts;
    return experts.filter(
      (e) =>
        e.display_name?.toLowerCase().includes(q) ||
        e.headline?.toLowerCase().includes(q) ||
        e.expertise?.toLowerCase().includes(q) ||
        e.bio?.toLowerCase().includes(q),
    );
  }, [experts, search]);

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

          <Tabs defaultValue="experts" className="mt-8">
            <TabsList>
              <TabsTrigger value="experts">
                Experts {experts && `(${filteredExperts.length})`}
              </TabsTrigger>
              <TabsTrigger value="podcasts">
                Podcasts {podcasts && `(${filteredPodcasts.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="experts" className="mt-6">
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
            </TabsContent>

            <TabsContent value="podcasts" className="mt-6">
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
            </TabsContent>
          </Tabs>
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
