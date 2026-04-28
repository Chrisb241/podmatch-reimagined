import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchSentRequests,
  type ContactRequestWithProfile,
  type ContactStatus,
} from "@/lib/contact";

const statusVariants: Record<ContactStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  accepted: { label: "Acceptée", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  declined: { label: "Refusée", className: "bg-muted text-muted-foreground" },
  archived: { label: "Refusée", className: "bg-muted text-muted-foreground" },
};

const SentRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequestWithProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchSentRequests(user.id);
        if (!cancelled) setRequests(data);
      } catch (err: any) {
        toast.error(err.message ?? "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-xl">
        <Send className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Vous n'avez encore contacté aucun expert.</p>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link to="/explore">Explorer les experts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const expertName = r.recipient_display_name ?? "Expert";
        const status = statusVariants[r.status];
        return (
          <div key={r.id} className="p-5 rounded-xl border bg-card">
            <div className="flex items-start gap-4">
              {r.recipient_avatar_url ? (
                <img
                  src={r.recipient_avatar_url}
                  alt={expertName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-semibold">
                  {expertName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{expertName}</h3>
                    {r.subject && (
                      <p className="text-sm text-muted-foreground mt-0.5">{r.subject}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
                {r.message && (
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {r.message}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Envoyée le {new Date(r.created_at).toLocaleString("fr-FR")}
                </p>

                {r.status === "accepted" && (
                  <div className="mt-4">
                    <Button
                      asChild
                      size="sm"
                      className="gradient-primary text-primary-foreground border-0"
                    >
                      <Link to="/messages/$requestId" params={{ requestId: r.id }}>
                        <MessageSquare className="h-4 w-4 mr-1" /> Ouvrir la messagerie
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SentRequests;
