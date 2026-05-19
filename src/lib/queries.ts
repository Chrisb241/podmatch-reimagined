import { supabase } from "@/integrations/supabase/client";

export interface ExpertWithProfile {
  id: string;
  user_id: string;
  headline: string | null;
  expertise: string | string[] | null;
  languages: string[] | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
}

export interface PodcastWithOwner {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  website_url: string | null;
  owner_display_name: string | null;
  owner_avatar_url: string | null;
}

export async function fetchExperts(): Promise<ExpertWithProfile[]> {
  const { data: experts, error } = await supabase
    .from("expert_profiles")
    .select("id, user_id, headline, expertise, languages")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!experts || experts.length === 0) return [];

  const userIds = Array.from(new Set(experts.map((e: any) => e.user_id).filter(Boolean)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, location")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return experts.map((e: any) => {
    const p = profileMap.get(e.user_id) ?? {};
    return {
      id: e.id,
      user_id: e.user_id,
      headline: e.headline ?? null,
      expertise: e.expertise ?? null,
      languages: e.languages ?? null,
      display_name: (p as any).display_name ?? null,
      avatar_url: (p as any).avatar_url ?? null,
      bio: (p as any).bio ?? null,
      location: (p as any).location ?? null,
    };
  });
}

export async function fetchPodcasts(): Promise<PodcastWithOwner[]> {
  const { data: podcasts, error } = await supabase
    .from("podcasts")
    .select("id, owner_id, title, description, cover_url, website_url")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!podcasts || podcasts.length === 0) return [];

  const ownerIds = Array.from(new Set(podcasts.map((p: any) => p.owner_id).filter(Boolean)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ownerIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return podcasts.map((p: any) => {
    const owner = profileMap.get(p.owner_id) ?? {};
    return {
      id: p.id,
      owner_id: p.owner_id,
      title: p.title,
      description: p.description,
      cover_url: p.cover_url,
      website_url: p.website_url,
      owner_display_name: (owner as any).display_name ?? null,
      owner_avatar_url: (owner as any).avatar_url ?? null,
    };
  });
}
