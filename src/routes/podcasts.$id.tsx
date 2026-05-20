import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Mic, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ContactExpertButton from "@/components/ContactExpertButton";

export const Route = createFileRoute("/podcasts/$id")({
  component: PodcastDetail,
});

interface Podcast {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  website_url: string | null;
}

interface Owner {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

function PodcastDetail() {
  const { id } = Route.useParams();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("podcasts")
        .select("id, owner_id, title, description, cover_url, website_url")
        .eq("id", id)
        .maybeSingle();
      const p = (data as Podcast | null) ?? null;
      setPodcast(p);
      if (p?.owner_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, bio")
          .eq("id", p.owner_id)
          .maybeSingle();
        setOwner((prof as Owner | null) ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour à l'exploration
          </Link>
          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : !podcast ? (
            <p className="text-muted-foreground">Podcast introuvable.</p>
          ) : (
            <>
              <div className="relative h-72 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/40">
                {podcast.cover_url ? (
                  <img src={podcast.cover_url} alt={podcast.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Mic className="h-28 w-28 text-primary/60" strokeWidth={1.5} />
                )}
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl mt-6">{podcast.title}</h1>

              {owner && (
                <Link
                  to="/profil/$id"
                  params={{ id: owner.id }}
                  className="mt-4 inline-flex items-center gap-3 group"
                >
                  {owner.avatar_url ? (
                    <img src={owner.avatar_url} alt={owner.display_name ?? ""} className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Animé par</p>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {owner.display_name ?? "Podcasteur"}
                    </p>
                  </div>
                </Link>
              )}

              {podcast.description && (
                <p className="mt-6 text-base leading-relaxed whitespace-pre-line">{podcast.description}</p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {podcast.website_url && (
                  <Button asChild>
                    <a href={podcast.website_url} target="_blank" rel="noopener noreferrer">
                      Visiter le site <ExternalLink className="h-4 w-4 ml-1.5" />
                    </a>
                  </Button>
                )}
                {owner && (
                  <ContactExpertButton expertId={owner.id} expertName={owner.display_name ?? "Podcasteur"} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
