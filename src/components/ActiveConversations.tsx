import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchConversations,
  type ContactRequestWithProfile,
} from "@/lib/contact";
import { Button } from "@/components/ui/button";

const ActiveConversations = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ContactRequestWithProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setItems(await fetchConversations(user.id));
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`conv_widget:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_requests" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-xl">
        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Aucune conversation active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((c) => {
        const other =
          c.sender_id === user?.id
            ? { name: c.recipient_display_name, avatar: c.recipient_avatar_url }
            : { name: c.sender_display_name, avatar: c.sender_avatar_url };
        const name = other.name ?? "Utilisateur";
        return (
          <Link
            key={c.id}
            to="/messages/$requestId"
            params={{ requestId: c.id }}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary transition-colors"
          >
            {other.avatar ? (
              <img
                src={other.avatar}
                alt={name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{name}</p>
              {c.subject && (
                <p className="text-xs text-muted-foreground truncate">{c.subject}</p>
              )}
            </div>
            <Button size="sm" variant="ghost">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default ActiveConversations;
