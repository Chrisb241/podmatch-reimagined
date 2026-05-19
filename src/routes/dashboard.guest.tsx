import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Mic2,
  User,
  MessageSquare,
  LogOut,
  Inbox,
  Clock,
  Edit,
} from "lucide-react";
import ReceivedRequests from "@/components/ReceivedRequests";
import ActiveConversations from "@/components/ActiveConversations";
import { useDashboardStats, StatCard } from "@/components/DashboardStats";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { UnreadBadge } from "@/components/UnreadBadge";

export const Route = createFileRoute("/dashboard/guest")({
  head: () => ({
    meta: [{ title: "Dashboard Expert — PodMatch" }],
  }),
  component: GuestDashboard,
});

function GuestDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats } = useDashboardStats();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth/login" });
    else if (role && role !== "guest") navigate({ to: "/dashboard/podcaster" });
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
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold">Bienvenue, expert ✨</h1>
            <p className="text-muted-foreground mt-2">
              Soyez visible auprès des podcasteurs qui cherchent votre expertise.
            </p>
          </div>
          <Button asChild className="gradient-primary text-primary-foreground border-0">
            <Link to="/profile/expert">
              <Edit className="h-4 w-4 mr-1" /> Modifier mon profil
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Demandes reçues"
            value={stats.receivedRequestsCount}
            icon={Inbox}
          />
          <StatCard
            label="En attente de réponse"
            value={stats.pendingReceived}
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
          <Link
            to="/profile/expert"
            className="block p-6 rounded-xl border hover:border-primary transition-all"
          >
            <User className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">Mon profil expert</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complétez votre profil pour être trouvé
            </p>
          </Link>
          <Link
            to="/messages"
            className="block p-6 rounded-xl border hover:border-primary transition-all"
          >
            <MessageSquare className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">Mes conversations</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Accéder à votre messagerie
            </p>
          </Link>
          <Link
            to="/explore"
            className="p-6 rounded-xl border hover:border-primary transition-all"
          >
            <Mic2 className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg">Voir les autres experts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Inspirez-vous des profils existants
            </p>
          </Link>
        </div>

        {/* Received requests */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Inbox className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-display font-bold">Demandes reçues</h2>
          </div>
          <ReceivedRequests />
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
