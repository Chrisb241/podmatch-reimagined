import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Mic, Plus, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  website_url: string | null;
}

const MyPodcasts = () => {
  const { user } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title, description, cover_url, website_url")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPodcasts((data ?? []) as Podcast[]);
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("podcasts").insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        cover_url: coverUrl.trim() || null,
        website_url: websiteUrl.trim() || null,
      });
      if (error) throw error;
      toast.success("Podcast créé");
      setTitle("");
      setDescription("");
      setCoverUrl("");
      setWebsiteUrl("");
      setOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce podcast ?")) return;
    try {
      const { error } = await supabase.from("podcasts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Supprimé");
      load();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0">
              <Plus className="h-4 w-4 mr-1" /> Nouveau podcast
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un podcast</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label htmlFor="p-title">Titre *</Label>
                <Input
                  id="p-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="p-cover">URL de la cover</Label>
                <Input
                  id="p-cover"
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="p-web">Site web</Label>
                <Input
                  id="p-web"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !podcasts || podcasts.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-xl">
          <Mic className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas encore de podcast. Créez-en un.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {podcasts.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border bg-card flex gap-4">
              {p.cover_url ? (
                <img
                  src={p.cover_url}
                  alt={p.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                  <Mic className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p.title}</h3>
                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {p.description}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  {p.website_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={p.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> Visiter
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPodcasts;
