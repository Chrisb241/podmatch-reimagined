import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Mic2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { TOPICS, parseTopics, serializeTopics } from "@/lib/topics";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/expert")({
  head: () => ({ meta: [{ title: "Mon profil expert — PodMatch" }] }),
  component: ExpertProfilePage,
});

function ExpertProfilePage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [degree, setDegree] = useState("");
  const [school, setSchool] = useState("");
  const [degreeYear, setDegreeYear] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [languages, setLanguages] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (role && role !== "guest") {
      navigate({ to: "/dashboard/podcaster" });
      return;
    }

    (async () => {
      const [{ data: profile }, { data: expert }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, bio, location, avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("expert_profiles")
          .select("headline, expertise, languages, job_title, company, degree, school, degree_year")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }
      if (expert) {
        setHeadline(expert.headline ?? "");
        setJobTitle((expert as any).job_title ?? "");
        setCompany((expert as any).company ?? "");
        setDegree((expert as any).degree ?? "");
        setSchool((expert as any).school ?? "");
        setDegreeYear((expert as any).degree_year ? String((expert as any).degree_year) : "");
        setTopics(Array.isArray(expert.expertise) ? expert.expertise : parseTopics(expert.expertise as unknown as string));
        setLanguages((expert.languages ?? []).join(", "));
      }
      setHydrated(true);
    })();
  }, [user, role, loading, navigate]);

  const toggleTopic = (t: string) => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        bio: bio || null,
        location: location || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", user.id);

    if (profileError) {
      toast.error(`Profil : ${profileError.message}`);
      setSaving(false);
      return;
    }

    const langArray = languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    const { error: expertError } = await supabase
      .from("expert_profiles")
      .upsert(
        {
          user_id: user.id,
          headline: headline || null,
          job_title: jobTitle || null,
          company: company || null,
          degree: degree || null,
          school: school || null,
          degree_year: degreeYear ? Number(degreeYear) : null,
          expertise: topics.length ? (topics as unknown as never) : null,
          languages: langArray.length ? langArray : null,
        } as any,
        { onConflict: "user_id" },
      );

    if (expertError) {
      toast.error(`Expertise : ${expertError.message}`);
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
            <Link to="/dashboard/guest">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-2">Mon profil expert</h1>
        <p className="text-muted-foreground mb-8">
          Complétez vos informations pour être trouvé par les podcasteurs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="displayName">Nom d'affichage</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="headline">Titre / Accroche</Label>
            <Input
              id="headline"
              placeholder="Ex : Coach business pour entrepreneurs"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Métier actuel</Label>
              <Input
                id="jobTitle"
                placeholder="Ex : Designer produit"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                placeholder="Ex : Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="degree">Diplôme</Label>
              <Input
                id="degree"
                placeholder="Ex : Master en Marketing"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="school">École / Université</Label>
              <Input
                id="school"
                placeholder="Ex : HEC Paris"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={5}
              placeholder="Présentez-vous en quelques lignes…"
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

          <div>
            <Label>Thématiques</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TOPICS.map((t) => {
                const active = topics.includes(t);
                return (
                  <Badge
                    key={t}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleTopic(t)}
                  >
                    {t}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="languages">Langues (séparées par des virgules)</Label>
            <Input
              id="languages"
              placeholder="Français, Anglais"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full gradient-primary text-primary-foreground border-0">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>

        {/* Zone danger : suppression de compte */}
        <div className="mt-16 border-t pt-8">
          <h2 className="text-lg font-display font-bold text-destructive">Zone dangereuse</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            La suppression de votre compte est définitive. Toutes vos données (profil, expertise,
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
                      await supabase.from("expert_profiles").delete().eq("user_id", user.id);
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
