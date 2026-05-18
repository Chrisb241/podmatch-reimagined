import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, User, Mic2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { parseTopics } from "@/lib/topics";
import ContactExpertButton from "@/components/ContactExpertButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/profil/$id")({
  head: () => ({
    meta: [{ title: "Profil expert — PodMatch" }],
  }),
  component: PublicExpertProfile,
});

interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  headline: string | null;
  expertise: string | null;
  languages: string[] | null;
  episodes_count: number;
}

const TAG_COLORS = [
  "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300",
  "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300",
  "bg-pink-500/15 text-pink-700 border-pink-500/30 dark:text-pink-300",
  "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  "bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-300",
  "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300",
];

function PublicExpertProfile() {
  const { id } = Route.useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const [{ data: profile }, { data: expert }, { count }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, display_name, avatar_url, bio, location")
            .eq("id", id)
            .maybeSingle(),
          supabase
            .from("expert_profiles")
            .select("headline, expertise, languages")
            .eq("user_id", id)
            .maybeSingle(),
          supabase
            .from("contact_requests")
            .select("id", { count: "exact", head: true })
            .eq("recipient_id", id)
            .eq("status", "accepted"),
        ]);

        if (cancelled) return;
        if (!profile) {
          setNotFound(true);
          return;
        }
        setData({
          id: profile.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          headline: expert?.headline ?? null,
          expertise: expert?.expertise ?? null,
          languages: expert?.languages ?? null,
          episodes_count: count ?? 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-display font-bold">Profil introuvable</h1>
          <p className="text-muted-foreground mt-2">
            Cet expert n'existe pas ou n'est plus disponible.
          </p>
          <Button asChild className="mt-6">
            <Link to="/explore">Retour à l'exploration</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const name = data.display_name ?? "Expert";
  const initial = name.charAt(0).toUpperCase();
  const topics = parseTopics(data.expertise);
  const isOwnProfile = user?.id === data.id;
  const isPodcaster = role === "podcaster";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/explore">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Link>
        </Button>

        {/* Header */}
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-card">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {data.avatar_url ? (
              <img
                src={data.avatar_url}
                alt={name}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-border"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-secondary flex items-center justify-center ring-4 ring-border text-3xl font-bold">
                {initial || <User className="h-10 w-10" />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-display font-bold">{name}</h1>
              {data.headline && (
                <p className="text-muted-foreground mt-1">{data.headline}</p>
              )}
              {data.location && (
                <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {data.location}
                </div>
              )}
            </div>

            {/* Stat */}
            <div className="flex md:flex-col gap-4 md:gap-2 md:text-right">
              <div className="flex items-center gap-2 md:flex-col md:items-end">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Mic2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold leading-none">
                    {data.episodes_count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Épisode{data.episodes_count > 1 ? "s" : ""} enregistré
                    {data.episodes_count > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact button */}
          {!isOwnProfile && (
            <div className="mt-6">
              {!user ? (
                <Button
                  className="gradient-primary text-primary-foreground border-0"
                  onClick={() => navigate({ to: "/auth/signup" })}
                >
                  <Send className="h-4 w-4 mr-2" /> Contacter
                </Button>
              ) : isPodcaster ? (
                <ContactExpertButton
                  expertId={data.id}
                  expertName={name}
                  className="gradient-primary text-primary-foreground border-0"
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Bio */}
        {data.bio && (
          <section className="mt-8">
            <h2 className="text-xl font-display font-bold mb-3">À propos</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {data.bio}
            </p>
          </section>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-display font-bold mb-3">Thématiques d'expertise</h2>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, i) => (
                <Badge
                  key={topic}
                  variant="outline"
                  className={`text-sm py-1 px-3 ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-display font-bold mb-3">Langues</h2>
            <div className="flex flex-wrap gap-2">
              {data.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-sm">
                  {lang}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
