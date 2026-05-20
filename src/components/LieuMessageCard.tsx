import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Laptop, MapPin, Mic, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Lieu {
  id: string;
  name: string;
  city: string | null;
  type: string | null;
  image_url: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  studio: "Studio",
  salle_evenement: "Salle d'événement",
  coworking: "Coworking",
};

const STYLES: Record<string, { bg: string; Icon: typeof MapPin }> = {
  studio: { bg: "#6D28D9", Icon: Mic },
  coworking: { bg: "#2563EB", Icon: Laptop },
  salle_evenement: { bg: "#BE185D", Icon: Users },
};

export function LieuMessageCard({ id, mine }: { id: string; mine: boolean }) {
  const [lieu, setLieu] = useState<Lieu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("lieux" as never)
        .select("id, name, city, type, image_url")
        .eq("id", id)
        .maybeSingle();
      if (!cancelled) {
        setLieu((data as unknown as Lieu) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { bg, Icon } = (lieu?.type && STYLES[lieu.type]) || { bg: "#374151", Icon: MapPin };

  if (loading) {
    return (
      <div className={`text-xs italic ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        Chargement du lieu...
      </div>
    );
  }
  if (!lieu) {
    return (
      <div className={`text-xs italic ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        Lieu introuvable
      </div>
    );
  }

  return (
    <Link
      to="/lieux/$id"
      params={{ id: lieu.id }}
      className={`block rounded-xl overflow-hidden border ${
        mine ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border bg-background"
      } hover:opacity-90 transition-opacity max-w-[280px]`}
    >
      <div className="relative h-28 flex items-center justify-center" style={{ backgroundColor: bg }}>
        {lieu.image_url ? (
          <img src={lieu.image_url} alt={lieu.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
        )}
      </div>
      <div className={`p-2.5 ${mine ? "text-primary-foreground" : "text-foreground"}`}>
        <p className="text-[10px] uppercase tracking-wide opacity-70">
          {lieu.type ? TYPE_LABELS[lieu.type] ?? lieu.type : "Lieu"}
        </p>
        <p className="font-semibold text-sm truncate">{lieu.name}</p>
        {lieu.city && (
          <p className="text-xs opacity-80 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" /> {lieu.city}
          </p>
        )}
        <p className="text-[11px] mt-1 inline-flex items-center gap-1 opacity-80">
          Voir le lieu <ExternalLink className="h-3 w-3" />
        </p>
      </div>
    </Link>
  );
}

const LIEU_REGEX = /\[lieu:([0-9a-f-]{36})\]/gi;

export type MessagePart =
  | { kind: "text"; value: string }
  | { kind: "lieu"; id: string };

export function parseMessageContent(content: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  for (const match of content.matchAll(LIEU_REGEX)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      const text = content.slice(lastIndex, start).trim();
      if (text) parts.push({ kind: "text", value: text });
    }
    parts.push({ kind: "lieu", id: match[1] });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) parts.push({ kind: "text", value: text });
  }
  if (parts.length === 0) parts.push({ kind: "text", value: content });
  return parts;
}

export function formatDayLabel(date: Date): string {
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "long" }).replace(/^./, (c) => c.toUpperCase());
  }
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
        {formatDayLabel(date)}
      </span>
    </div>
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MessageContent({ content, mine }: { content: string; mine: boolean }) {
  const parts = parseMessageContent(content);
  return (
    <div className="space-y-2">
      {parts.map((p, i) =>
        p.kind === "text" ? (
          <p key={i} className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {p.value}
          </p>
        ) : (
          <LieuMessageCard key={i} id={p.id} mine={mine} />
        ),
      )}
    </div>
  );
}
