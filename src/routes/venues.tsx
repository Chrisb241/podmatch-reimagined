import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VenueCard from "@/components/VenueCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { mockVenues } from "@/data/mockData";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Trouver un lieu d'interview — PodMatch" },
      { name: "description", content: "Studios, cafés calmes, coworkings — trouvez l'espace idéal pour enregistrer votre podcast." },
      { property: "og:title", content: "Lieux d'interview — PodMatch" },
      { property: "og:description", content: "Réservez le lieu parfait pour vos enregistrements." },
    ],
  }),
  component: Venues,
});

const cities = ["Toutes", "Paris", "Lyon", "Marseille", "Nantes"];
const types = ["Tous", "Studio professionnel", "Café calme", "Coworking", "Studio privé"];

function Venues() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");

  const filtered = useMemo(() => {
    return mockVenues.filter((v) => {
      if (selectedCity !== "Toutes" && v.city !== selectedCity) return false;
      if (selectedType !== "Tous" && v.type !== selectedType) return false;
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, selectedCity, selectedType]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-3xl md:text-4xl">Trouver un lieu d'interview</h1>
            <p className="mt-2 text-muted-foreground">Studios, cafés calmes, coworkings — trouvez l'espace idéal pour enregistrer.</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un lieu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Badge
                key={c}
                variant={selectedCity === c ? "default" : "outline"}
                className={`cursor-pointer text-xs ${selectedCity === c ? "gradient-primary text-primary-foreground border-0" : ""}`}
                onClick={() => setSelectedCity(c)}
              >
                {c}
              </Badge>
            ))}
            <span className="w-px h-6 bg-border mx-1" />
            {types.map((t) => (
              <Badge
                key={t}
                variant={selectedType === t ? "default" : "outline"}
                className={`cursor-pointer text-xs ${selectedType === t ? "gradient-primary text-primary-foreground border-0" : ""}`}
                onClick={() => setSelectedType(t)}
              >
                {t}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} lieu{filtered.length !== 1 ? "x" : ""} trouvé{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((v) => (
                  <VenueCard key={v.id} venue={v} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Aucun lieu trouvé</p>
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
