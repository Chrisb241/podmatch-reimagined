import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Share2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchConversations,
  sendMessage,
  type ContactRequestWithProfile,
} from "@/lib/contact";

interface Props {
  lieuId: string;
  lieuName: string;
}

export function ShareLieuDialog({ lieuId, lieuName }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversations, setConversations] = useState<ContactRequestWithProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchConversations(user.id);
        if (!cancelled) setConversations(list);
      } catch (err: any) {
        toast.error(err.message ?? "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const handleShare = async () => {
    if (!selectedId) return;
    try {
      setSending(true);
      const noteText = note.trim();
      const content = `${noteText ? noteText + "\n\n" : ""}[lieu:${lieuId}]`;
      await sendMessage({ contact_request_id: selectedId, content });
      toast.success("Lieu partagé !");
      setOpen(false);
      setSelectedId(null);
      setNote("");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  };

  const otherName = (c: ContactRequestWithProfile) =>
    c.sender_id === user?.id
      ? c.recipient_display_name ?? "Utilisateur"
      : c.sender_display_name ?? "Utilisateur";

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-1.5" /> Partager dans une conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partager « {lieuName} »</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Choisissez une conversation</p>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {loading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Aucune conversation active.
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        isActive ? "bg-muted" : ""
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{otherName(c)}</p>
                      {c.subject && (
                        <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Ajouter un message (optionnel)</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex : Qu'en penses-tu de ce lieu ?"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={sending}>
            Annuler
          </Button>
          <Button
            onClick={handleShare}
            disabled={!selectedId || sending}
            className="gradient-primary text-primary-foreground border-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Partager"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
