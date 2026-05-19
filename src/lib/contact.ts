import { supabase } from "@/integrations/supabase/client";

export type ContactStatus = "pending" | "accepted" | "declined" | "archived";

export interface ContactRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  podcast_id: string | null;
  subject: string | null;
  message: string | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactRequestWithProfile extends ContactRequest {
  sender_display_name: string | null;
  sender_avatar_url: string | null;
  recipient_display_name: string | null;
  recipient_avatar_url: string | null;
}

export interface Message {
  id: string;
  contact_request_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export async function createContactRequest(input: {
  recipient_id: string;
  subject: string;
  message: string;
}): Promise<ContactRequest> {
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUser = sessionData.session?.user;
  if (!currentUser) throw new Error("Vous devez être connecté");
  if (currentUser.id === input.recipient_id) {
    throw new Error("Vous ne pouvez pas vous contacter vous-même");
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .insert({
      sender_id: currentUser.id,
      recipient_id: input.recipient_id,
      subject: input.subject.trim() || null,
      message: input.message.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as ContactRequest;
}

async function attachProfiles(rows: ContactRequest[]): Promise<ContactRequestWithProfile[]> {
  if (rows.length === 0) return [];
  const ids = Array.from(new Set(rows.flatMap((r) => [r.sender_id, r.recipient_id])));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);
  const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  return rows.map((r) => {
    const s = map.get(r.sender_id) ?? ({} as any);
    const re = map.get(r.recipient_id) ?? ({} as any);
    return {
      ...r,
      sender_display_name: s.display_name ?? null,
      sender_avatar_url: s.avatar_url ?? null,
      recipient_display_name: re.display_name ?? null,
      recipient_avatar_url: re.avatar_url ?? null,
    };
  });
}

export async function fetchReceivedRequests(userId: string): Promise<ContactRequestWithProfile[]> {
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachProfiles((data ?? []) as ContactRequest[]);
}

export async function fetchSentRequests(userId: string): Promise<ContactRequestWithProfile[]> {
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachProfiles((data ?? []) as ContactRequest[]);
}

export async function fetchConversations(userId: string): Promise<ContactRequestWithProfile[]> {
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return attachProfiles((data ?? []) as ContactRequest[]);
}

export async function updateRequestStatus(
  id: string,
  status: ContactStatus,
): Promise<void> {
  const { error } = await supabase
    .from("contact_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchRequest(id: string): Promise<ContactRequestWithProfile | null> {
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [withProfile] = await attachProfiles([data as ContactRequest]);
  return withProfile ?? null;
}

export async function fetchMessages(requestId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("contact_request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(input: {
  contact_request_id: string;
  content: string;
}): Promise<Message> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("Vous devez être connecté");
  const { data, error } = await supabase
    .from("messages")
    .insert({
      contact_request_id: input.contact_request_id,
      sender_id: userId,
      content: input.content.trim(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}
