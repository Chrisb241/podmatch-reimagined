import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, MessageSquare, Inbox } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchReceivedRequests,
  updateRequestStatus,
  type ContactRequestWithProfile,
  type ContactStatus,
} from "@/lib/contact";

const statusVariants: Record<ContactStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  accepted: { label: "Acceptée", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  declined: { label: "Refusée", className: "bg-muted text-muted-foreground" },
  archived: { label: "Archivée", className: "bg-muted text-muted-foreground" },
};

const ReceivedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequestWithProfile[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchReceivedRequests(user.id);
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAction = async (id: string, status: ContactStatus) => {
    try {
      setActionId(id);
      await updateRequestStatus(id, status);
      toast.success(status === "accepted" ? "Demande acceptée" : "Demande refusée");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally {
      setActionId(null);
    }
  };

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
        <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Aucune demande reçue pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const senderName = r.sender_display_name ?? "Podcasteur";
        const status = statusVariants[r.status];
        return (
          <div key={r.id} className="p-5 rounded-xl border bg-card">
            <div className="flex items-start gap-4">
              <Link
                to="/profil/$id"
                params={{ id: r.sender_id }}
                className="shrink-0 hover:opacity-90 transition-opacity"
                aria-label={`Voir le profil de ${senderName}`}
              >
                {r.sender_avatar_url ? (
                  <img
                    src={r.sender_avatar_url}
                    alt={senderName}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-semibold">
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to="/profil/$id"
                      params={{ id: r.sender_id }}
                      className="font-semibold hover:underline underline-offset-4"
                    >
                      {senderName}
                    </Link>
                    {r.subject && (
                      <p className="text-sm text-muted-foreground mt-0.5">{r.subject}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
                {r.message && (
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {r.message}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("fr-FR")}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAction(r.id, "accepted")}
                        disabled={actionId === r.id}
                        className="gradient-primary text-primary-foreground border-0"
                      >
                        <Check className="h-4 w-4 mr-1" /> Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(r.id, "archived")}
                        disabled={actionId === r.id}
                      >
                        <X className="h-4 w-4 mr-1" /> Refuser
                      </Button>
                    </>
                  )}
                  {r.status === "accepted" && (
                    <Button
                      asChild
                      size="sm"
                      className="gradient-primary text-primary-foreground border-0"
                    >
                      <Link to="/messages/$requestId" params={{ requestId: r.id }}>
                        <MessageSquare className="h-4 w-4 mr-1" /> Ouvrir la messagerie
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReceivedRequests;
