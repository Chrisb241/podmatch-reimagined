import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { mockProfiles, allTopics } from "@/data/mockData";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explorer les profils — PodMatch" },
      { name: "description", content: "Trouvez le podcasteur ou l'invité parfait pour votre prochain épisode." },
      { property: "og:title", content: "Explorer les profils — PodMatch" },
      { property: "og:description", content: "Filtrez par thématique, disponibilité et type de profil." },
    ],
  }),
  component: Explore,
});

const availabilityOptions = [
  { value: "remote" as const, label: "À distance" },
  { value: "in-person" as const, label: "Sur place" },
  { value: "travel" as const, label: "Déplacement" },
];

const typeOptions = [
  { value: "all", label: "Tous" },
  { value: "podcaster", label: "Podcasteurs" },
  { value: "guest", label: "Invités" },
];

function Explore() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleAvailability = (a: string) =>
    setSelectedAvailability((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const filtered = useMemo(() => {
    return mockProfiles.filter((p) => {
      if (selectedType !== "all" && p.type !== selectedType) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.bio.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedTopics.length && !selectedTopics.some((t) => p.topics.includes(t))) return false;
      if (selectedAvailability.length && !selectedAvailability.some((a) => p.availability.includes(a as never))) return false;
      return true;
    });
  }, [search, selectedType, selectedTopics, selectedAvailability]);

  const hasFilters = selectedTopics.length > 0 || selectedAvailability.length > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-3xl md:text-4xl">Explorer les profils</h1>
            <p className="mt-2 text-muted-foreground">Trouvez le podcasteur ou l'invité parfait pour votre prochain épisode.</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, sujet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {typeOptions.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={selectedType === opt.value ? "default" : "outline"}
                  className={selectedType === opt.value ? "gradient-primary text-primary-foreground border-0" : ""}
                  onClick={() => setSelectedType(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-5 bg-secondary/50 rounded-xl border space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Thématiques</h4>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((t) => (
                    <Badge
                      key={t}
                      variant={selectedTopics.includes(t) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${selectedTopics.includes(t) ? "gradient-primary text-primary-foreground border-0" : ""}`}
                      onClick={() => toggleTopic(t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Disponibilité</h4>
                <div className="flex flex-wrap gap-2">
                  {availabilityOptions.map((a) => (
                    <Badge
                      key={a.value}
                      variant={selectedAvailability.includes(a.value) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${selectedAvailability.includes(a.value) ? "gradient-primary text-primary-foreground border-0" : ""}`}
                      onClick={() => toggleAvailability(a.value)}
                    >
                      {a.label}
                    </Badge>
                  ))}
                </div>
              </div>
              {hasFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => { setSelectedTopics([]); setSelectedAvailability([]); }}
                >
                  <X className="h-3 w-3 mr-1" /> Effacer les filtres
                </Button>
              )}
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} profil{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Aucun profil trouvé</p>
                <p className="text-sm mt-1">Essayez d'ajuster vos filtres</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
