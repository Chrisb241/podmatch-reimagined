import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchMessages,
  fetchRequest,
  sendMessage,
  type ContactRequestWithProfile,
  type Message,
} from "@/lib/contact";
import { markConversationRead } from "@/hooks/useUnreadMessages";

export const Route = createFileRoute("/messages/$requestId")({
  head: () => ({
    meta: [{ title: "Messagerie — PodMatch" }],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { requestId } = useParams({ from: "/messages/$requestId" });
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ContactRequestWithProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/auth/login" });
  }, [user, authLoading, navigate]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetchRequest(requestId);
        if (cancelled) return;
        if (!r) {
          toast.error("Conversation introuvable");
          navigate({ to: "/" });
          return;
        }
        if (r.sender_id !== user.id && r.recipient_id !== user.id) {
          toast.error("Vous n'avez pas accès à cette conversation");
          navigate({ to: "/" });
          return;
        }
        if (r.status !== "accepted") {
          toast.error("Cette demande n'est pas acceptée");
          navigate({ to: "/" });
          return;
        }
        setRequest(r);
        const msgs = await fetchMessages(requestId);
        if (!cancelled) setMessages(msgs);
        // Mark conversation as read on open
        markConversationRead(requestId, user.id).catch(() => {});
      } catch (err: any) {
        toast.error(err.message ?? "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestId, user?.id, navigate, user]);

  // Polling every 5s
  useEffect(() => {
    if (!request) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await fetchMessages(requestId);
        setMessages((prev) => (msgs.length !== prev.length ? msgs : prev));
      } catch {
        // ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [request, requestId]);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    try {
      setSending(true);
      const msg = await sendMessage({ contact_request_id: requestId, content });
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) return null;

  const otherName =
    request.sender_id === user.id
      ? request.recipient_display_name ?? "Expert"
      : request.sender_display_name ?? "Podcasteur";
  const otherAvatar =
    request.sender_id === user.id
      ? request.recipient_avatar_url
      : request.sender_avatar_url;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto h-16 px-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {otherAvatar ? (
              <img
                src={otherAvatar}
                alt={otherName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                {otherName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{otherName}</p>
              {request.subject && (
                <p className="text-xs text-muted-foreground truncate">{request.subject}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl w-full flex flex-col">
        <div className="flex-1 space-y-3 pb-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun message pour l'instant.</p>
              <p className="text-xs mt-1">Envoyez le premier message ci-dessous.</p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {m.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="sticky bottom-4 bg-card border rounded-xl p-3 shadow-lg flex gap-2 items-end"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez un message..."
            rows={1}
            maxLength={2000}
            className="resize-none min-h-[40px] max-h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || sending}
            className="gradient-primary text-primary-foreground border-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
