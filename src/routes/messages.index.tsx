import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  type ContactRequestWithProfile,
  type Message,
} from "@/lib/contact";
import { markConversationRead } from "@/hooks/useUnreadMessages";

export const Route = createFileRoute("/messages/")({
  head: () => ({
    meta: [{ title: "Messagerie — PodMatch" }],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ContactRequestWithProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/auth/login" });
  }, [user, authLoading, navigate]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchConversations(user.id);
        if (cancelled) return;
        setConversations(list);
        if (list.length > 0 && !activeId) setActiveId(list[0].id);
      } catch (err: any) {
        toast.error(err.message ?? "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingMsgs(true);
        const msgs = await fetchMessages(activeId);
        if (!cancelled) setMessages(msgs);
        if (user) markConversationRead(activeId, user.id).catch(() => {});
      } catch (err: any) {
        toast.error(err.message ?? "Erreur de chargement");
      } finally {
        if (!cancelled) setLoadingMsgs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId, user?.id]);

  // Realtime subscription for messages of active conversation
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `contact_request_id=eq.${activeId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  // Realtime for new conversations / status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`contact_requests:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_requests" },
        async () => {
          try {
            const list = await fetchConversations(user.id);
            setConversations(list);
          } catch {
            /* ignore */
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || !activeId) return;
    try {
      setSending(true);
      const msg = await sendMessage({ contact_request_id: activeId, content });
      setMessages((prev) =>
        prev.some((x) => x.id === msg.id) ? prev : [...prev, msg],
      );
      setInput("");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const otherName = (c: ContactRequestWithProfile) =>
    c.sender_id === user.id
      ? c.recipient_display_name ?? "Utilisateur"
      : c.sender_display_name ?? "Utilisateur";
  const otherAvatar = (c: ContactRequestWithProfile) =>
    c.sender_id === user.id ? c.recipient_avatar_url : c.sender_avatar_url;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto h-16 px-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-semibold">Messagerie</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-0 md:px-4 py-0 md:py-6 w-full">
        <div className="grid md:grid-cols-[320px_1fr] gap-0 md:gap-4 h-[calc(100vh-4rem)] md:h-[calc(100vh-7rem)] border md:rounded-xl overflow-hidden bg-card">
          {/* Conversation list */}
          <aside className="border-r flex flex-col min-h-0">
            <div className="p-3 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Conversations
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Aucune conversation pour l'instant.
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === activeId;
                  const name = otherName(c);
                  const avatar = otherAvatar(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 border-b text-left transition-colors hover:bg-muted/50 ${
                        isActive ? "bg-muted" : ""
                      }`}
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-border shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-semibold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{name}</p>
                        {c.subject && (
                          <p className="text-xs text-muted-foreground truncate">
                            {c.subject}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Messages panel */}
          <section className="flex flex-col min-h-0">
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Sélectionnez une conversation
              </div>
            ) : (
              <>
                <div className="border-b px-4 py-3 flex items-center gap-3">
                  {otherAvatar(active) ? (
                    <img
                      src={otherAvatar(active)!}
                      alt={otherName(active)}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                      {otherName(active).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{otherName(active)}</p>
                    {active.subject && (
                      <p className="text-xs text-muted-foreground truncate">
                        {active.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
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
                                mine
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
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
                  className="border-t p-3 flex gap-2 items-end bg-card"
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
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
