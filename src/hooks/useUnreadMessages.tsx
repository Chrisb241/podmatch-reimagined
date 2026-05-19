import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UnreadState {
  total: number;
  byConversation: Record<string, number>;
}

export function useUnreadMessages() {
  const { user } = useAuth();
  const [state, setState] = useState<UnreadState>({ total: 0, byConversation: {} });

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ total: 0, byConversation: {} });
      return;
    }
    // Get conversations where user is participant
    const { data: reqs } = await supabase
      .from("contact_requests")
      .select("id")
      .eq("status", "accepted")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
    const ids = (reqs ?? []).map((r: any) => r.id);
    if (ids.length === 0) {
      setState({ total: 0, byConversation: {} });
      return;
    }
    const { data: msgs } = await supabase
      .from("messages")
      .select("contact_request_id")
      .in("contact_request_id", ids)
      .is("read_at", null)
      .neq("sender_id", user.id);
    const byConv: Record<string, number> = {};
    (msgs ?? []).forEach((m: any) => {
      byConv[m.contact_request_id] = (byConv[m.contact_request_id] ?? 0) + 1;
    });
    const total = Object.values(byConv).reduce((a, b) => a + b, 0);
    setState({ total, byConversation: byConv });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`unread-messages:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as any;
          if (m.sender_id === user.id) return;
          if (m.read_at) return;
          setState((prev) => {
            const next = { ...prev.byConversation };
            next[m.contact_request_id] = (next[m.contact_request_id] ?? 0) + 1;
            return {
              total: prev.total + 1,
              byConversation: next,
            };
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          // A message was marked as read; recompute.
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_requests" },
        () => {
          refresh();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  return { ...state, refresh };
}

export async function markConversationRead(requestId: string, userId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("contact_request_id", requestId)
    .neq("sender_id", userId)
    .is("read_at", null);
}
