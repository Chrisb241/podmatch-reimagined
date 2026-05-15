import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Trouver un lieu d'interview — PodMatch" },
      { name: "description", content: "Studios, salles d'événement et coworkings en France pour enregistrer votre podcast." },
    ],
  }),
  component: Venues,
});

interface Lieu {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  type: string | null;
  capacity: number | null;
  website: string | null;
  image_url: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  studio: "Studio",
  salle_evenement: "Salle d'événement",
  coworking: "Coworking",
};

const TYPE_IMAGES: Record<string, string> = {
  studio: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
  coworking: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  salle_evenement: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
};

function Venues() {
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Toutes");
  const [selectedType, setSelectedType] = useState("Tous");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("lieux" as never).select("*");
      if (!error && data) setLieux(data as unknown as Lieu[]);
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(() => {
    const set = new Set(lieux.map((l) => l.city).filter(Boolean) as string[]);
    return ["Toutes", ...Array.from(set).sort()];
  }, [lieux]);

  const types = useMemo(() => {
    const set = new Set(lieux.map((l) => l.type).filter(Boolean) as string[]);
    return ["Tous", ...Array.from(set)];
  }, [lieux]);

  const filtered = useMemo(() => {
    return lieux.filter((l) => {
      if (selectedCity !== "Toutes" && l.city !== selectedCity) return false;
      if (selectedType !== "Tous" && l.type !== selectedType) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.name.toLowerCase().includes(q) &&
          !(l.description ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [lieux, search, selectedCity, selectedType]);


  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-3xl md:text-4xl">
              Trouver un lieu d'interview
            </h1>
            <p className="mt-2 text-muted-foreground">
              Studios, salles d'événement et coworkings — trouvez l'espace idéal pour
              enregistrer.
            </p>
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
                {t === "Tous" ? t : TYPE_LABELS[t] ?? t}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              {loading
                ? "Chargement..."
                : `${filtered.length} lieu${filtered.length !== 1 ? "x" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
            </p>
            {!loading && filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((l) => (
                  <div
                    key={l.id}
                    className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {l.image_url && (
                      <div className="relative overflow-hidden">
                        <img
                          src={l.image_url}
                          alt={l.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {l.type && (
                          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm border-0 text-[10px]">
                            {TYPE_LABELS[l.type] ?? l.type}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display font-semibold text-base">{l.name}</h3>
                      {l.city && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {l.city}
                        </div>
                      )}
                      {l.capacity != null && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          Capacité : {l.capacity}
                        </div>
                      )}
                      {l.description && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                          {l.description}
                        </p>
                      )}
                      {l.website && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-4"
                          asChild
                        >
                          <a href={l.website} target="_blank" rel="noopener noreferrer">
                            Visiter le site
                            <ExternalLink className="h-3 w-3 ml-1.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Aucun lieu trouvé</p>
                <p className="text-sm mt-1">Essayez d'ajuster vos filtres</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
