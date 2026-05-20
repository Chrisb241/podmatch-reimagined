import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Mic2,
  Search,
  MessageSquare,
  LogOut,
  Send,
  Users,
  Mic,
  Clock,
} from "lucide-react";
import SentRequests from "@/components/SentRequests";
import MyPodcasts from "@/components/MyPodcasts";
import ActiveConversations from "@/components/ActiveConversations";
import { useDashboardStats, StatCard } from "@/components/DashboardStats";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { UnreadBadge } from "@/components/UnreadBadge";

export const Route = createFileRoute("/dashboard/podcaster")({
  head: () => ({
    meta: [{ title: "Dashboard Podcasteur — PodMatch" }],
  }),
  component: PodcasterDashboard,
});

function PodcasterDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats } = useDashboardStats();
  const { total: unreadTotal } = useUnreadMessages();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth/login" });
    else if (role && role !== "podcaster") navigate({ to: "/dashboard/guest" });
  }, [user, role, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">PodMatch</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile/podcaster">Mon profil</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold">Bienvenue, podcasteur 🎙️</h1>
          <p className="text-muted-foreground mt-2">
            Trouvez le prochain invité parfait pour votre podcast.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Experts contactés"
            value={stats.uniqueExpertsContacted}
            icon={Users}
          />
          <StatCard
            label="Demandes en attente"
            value={stats.pendingSent}
            icon={Clock}
          />
          <StatCard
            label="Conversations actives"
            value={stats.acceptedConversations}
            icon={MessageSquare}
          />
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/explore" className="p-6 rounded-xl border hover:border-primary transition-all">
            <Search className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">Explorer les experts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Parcourez la liste des invités disponibles
            </p>
          </Link>
          <Link to="/venues" className="p-6 rounded-xl border hover:border-primary transition-all">
            <Mic2 className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">Réserver un studio</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Trouvez un lieu pour vos enregistrements
            </p>
          </Link>
          <Link to="/messages" className="relative p-6 rounded-xl border hover:border-primary transition-all">
            <MessageSquare className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Mes conversations
              {unreadTotal > 0 && <UnreadBadge count={unreadTotal} />}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Accéder à votre messagerie
            </p>
          </Link>
        </div>

        {/* My podcasts */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Mic className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-display font-bold">Mes podcasts</h2>
          </div>
          <MyPodcasts />
        </section>

        {/* Sent requests */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Send className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-display font-bold">Demandes envoyées</h2>
          </div>
          <SentRequests />
        </section>

        {/* Active conversations */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-display font-bold">Conversations actives</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/messages">Tout voir</Link>
            </Button>
          </div>
          <ActiveConversations />
        </section>
      </main>
    </div>
  );
}
