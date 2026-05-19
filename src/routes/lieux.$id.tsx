import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Laptop, MapPin, Mic, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ShareLieuDialog } from "@/components/ShareLieuDialog";

export const Route = createFileRoute("/lieux/$id")({
  component: LieuDetail,
});

interface Lieu {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
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

function LieuDetail() {
  const { id } = Route.useParams();
  const [lieu, setLieu] = useState<Lieu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("lieux" as never).select("*").eq("id", id).maybeSingle();
      setLieu((data as unknown as Lieu) ?? null);
      setLoading(false);
    })();
  }, [id]);

  const styles: Record<string, { bg: string; Icon: typeof MapPin }> = {
    studio: { bg: "#6D28D9", Icon: Mic },
    coworking: { bg: "#2563EB", Icon: Laptop },
    salle_evenement: { bg: "#BE185D", Icon: Users },
  };
  const { bg, Icon } = (lieu?.type && styles[lieu.type]) || { bg: "#374151", Icon: MapPin };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/venues" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour aux lieux
          </Link>
          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : !lieu ? (
            <p className="text-muted-foreground">Lieu introuvable.</p>
          ) : (
            <>
              <div className="relative h-72 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: bg }}>
                {lieu.image_url ? (
                  <img src={lieu.image_url} alt={lieu.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Icon className="h-28 w-28 text-white" strokeWidth={1.5} />
                )}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {lieu.type && <Badge variant="outline">{TYPE_LABELS[lieu.type] ?? lieu.type}</Badge>}
                {lieu.city && (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {lieu.city}
                  </span>
                )}
                {lieu.capacity != null && (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> Capacité : {lieu.capacity}
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl mt-3">{lieu.name}</h1>
              {lieu.address && (
                <p className="mt-2 text-muted-foreground">
                  {lieu.address}
                  {lieu.postal_code ? `, ${lieu.postal_code}` : ""}
                  {lieu.city ? ` ${lieu.city}` : ""}
                </p>
              )}
              {lieu.description && <p className="mt-6 text-base leading-relaxed whitespace-pre-line">{lieu.description}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {lieu.website && (
                  <Button asChild>
                    <a href={lieu.website} target="_blank" rel="noopener noreferrer">
                      Visiter le site <ExternalLink className="h-4 w-4 ml-1.5" />
                    </a>
                  </Button>
                )}
                <ShareLieuDialog lieuId={lieu.id} lieuName={lieu.name} />
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
