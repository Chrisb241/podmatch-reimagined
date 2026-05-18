import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  uniqueExpertsContacted: number;
  receivedRequestsCount: number;
  acceptedConversations: number;
  pendingSent: number;
  pendingReceived: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    uniqueExpertsContacted: 0,
    receivedRequestsCount: 0,
    acceptedConversations: 0,
    pendingSent: 0,
    pendingReceived: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [sentRes, recvRes, convRes] = await Promise.all([
        supabase
          .from("contact_requests")
          .select("recipient_id, status")
          .eq("sender_id", user.id),
        supabase
          .from("contact_requests")
          .select("id, status")
          .eq("recipient_id", user.id),
        supabase
          .from("contact_requests")
          .select("id")
          .eq("status", "accepted")
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
      ]);
      const sent = sentRes.data ?? [];
      const recv = recvRes.data ?? [];
      const conv = convRes.data ?? [];
      setStats({
        uniqueExpertsContacted: new Set(sent.map((r: any) => r.recipient_id)).size,
        receivedRequestsCount: recv.length,
        acceptedConversations: conv.length,
        pendingSent: sent.filter((r: any) => r.status === "pending").length,
        pendingReceived: recv.filter((r: any) => r.status === "pending").length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`stats:${user.id}`)
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

  return { stats, loading };
};

export const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="p-5 rounded-xl border bg-card flex items-center gap-4">
    <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
      <Icon className="h-6 w-6 text-primary-foreground" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);
