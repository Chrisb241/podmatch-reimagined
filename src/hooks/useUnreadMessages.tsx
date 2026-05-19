import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UnreadState {
  total: number;
  byConversation: Record<string, number>;
}

const LS_KEY = "pm:lastReadAt";

function loadLastRead(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLastRead(map: Record<string, string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function useUnreadMessages() {
  const { user } = useAuth();
  const [state, setState] = useState<UnreadState>({ total: 0, byConversation: {} });
  const lastReadRef = useRef<Record<string, string>>({});

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ total: 0, byConversation: {} });
      return;
    }
    lastReadRef.current = loadLastRead();
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
      .select("contact_request_id, sender_id, created_at, read_at")
      .in("contact_request_id", ids)
      .neq("sender_id", user.id);
    const byConv: Record<string, number> = {};
    (msgs ?? []).forEach((m: any) => {
      // Considered read if DB read_at set OR localStorage lastRead >= message time
      const lastRead = lastReadRef.current[m.contact_request_id];
      const isRead =
        !!m.read_at ||
        (lastRead && new Date(lastRead).getTime() >= new Date(m.created_at).getTime());
      if (!isRead) {
        byConv[m.contact_request_id] = (byConv[m.contact_request_id] ?? 0) + 1;
      }
    });
    const total = Object.values(byConv).reduce((a, b) => a + b, 0);
    setState({ total, byConversation: byConv });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onRead = (e: Event) => {
      const detail = (e as CustomEvent).detail as { requestId?: string };
      if (!detail?.requestId) return;
      setState((prev) => {
        if (!prev.byConversation[detail.requestId!]) return prev;
        const next = { ...prev.byConversation };
        const removed = next[detail.requestId!] ?? 0;
        delete next[detail.requestId!];
        return { total: Math.max(0, prev.total - removed), byConversation: next };
      });
    };
    window.addEventListener("pm:conversation-read", onRead);
    return () => window.removeEventListener("pm:conversation-read", onRead);
  }, []);

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
            return { total: prev.total + 1, byConversation: next };
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_requests" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  return { ...state, refresh };
}

export async function markConversationRead(requestId: string, userId: string) {
  // Optimistic local store — independent of RLS
  const map = loadLastRead();
  map[requestId] = new Date().toISOString();
  saveLastRead(map);
  // Best-effort DB update
  try {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("contact_request_id", requestId)
      .neq("sender_id", userId)
      .is("read_at", null);
  } catch {
    /* ignore — local store covers it */
  }
  // Notify other tabs / hook instances
  try {
    window.dispatchEvent(new CustomEvent("pm:conversation-read", { detail: { requestId } }));
  } catch {
    /* ignore */
  }
}
