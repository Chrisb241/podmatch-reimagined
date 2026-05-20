import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Mic2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/podcaster")({
  head: () => ({ meta: [{ title: "Mon profil podcasteur — PodMatch" }] }),
  component: PodcasterProfilePage,
});

function PodcasterProfilePage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (role && role !== "podcaster") {
      navigate({ to: "/dashboard/guest" });
      return;
    }

    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, bio, location, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }
      setHydrated(true);
    })();
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          display_name: displayName || null,
          bio: bio || null,
          location: location || null,
          avatar_url: avatarUrl || null,
        },
        { onConflict: "id" },
      );

    if (error) {
      toast.error(`Profil : ${error.message}`);
      setSaving(false);
      return;
    }

    toast.success("Profil mis à jour !");
    setSaving(false);
  };

  if (loading || !user || !hydrated) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">PodMatch</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/podcaster">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-2">Mon profil podcasteur</h1>
        <p className="text-muted-foreground mb-8">
          Présentez-vous aux invités que vous souhaitez contacter.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="displayName">Nom d'affichage</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={6}
              placeholder="Parlez de vous, de votre podcast, du ton et des thématiques abordées…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input id="location" placeholder="Paris, France" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div>
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="h-20 w-20 rounded-full bg-muted overflow-hidden ring-2 ring-border flex items-center justify-center text-muted-foreground text-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  "Aucune"
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image trop lourde (max 2 Mo)");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setAvatarUrl(String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
                {avatarUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl("")}>
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full gradient-primary text-primary-foreground border-0">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>

        <div className="mt-16 border-t pt-8">
          <h2 className="text-lg font-display font-bold text-destructive">Zone dangereuse</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            La suppression de votre compte est définitive. Toutes vos données (profil, podcasts,
            demandes, messages) seront effacées.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Vos données seront immédiatement supprimées et
                  vous serez déconnecté.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    if (!user) return;
                    try {
                      const { error } = await supabase
                        .from("profiles")
                        .delete()
                        .eq("id", user.id);
                      if (error) throw error;
                      await supabase.auth.signOut();
                      toast.success("Votre compte a été supprimé.");
                      navigate({ to: "/" });
                    } catch (err: any) {
                      toast.error(`Suppression impossible : ${err.message ?? err}`);
                    }
                  }}
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
