import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mic2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Inscription — PodMatch" },
      { name: "description", content: "Créez votre compte podcasteur ou expert sur PodMatch." },
    ],
  }),
  component: SignupPage,
});

type Role = "podcaster" | "guest";

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("podcaster");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      // Insert role (profile is created by DB trigger)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleError) {
        toast.error(`Compte créé mais rôle non assigné : ${roleError.message}`);
        setLoading(false);
        return;
      }
    }

    toast.success("Compte créé ! Redirection…");
    setTimeout(() => {
      navigate({ to: role === "podcaster" ? "/dashboard/podcaster" : "/dashboard/guest" });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl">PodMatch</span>
          </Link>
          <h1 className="text-3xl font-display font-bold">Créer un compte</h1>
          <p className="text-muted-foreground mt-2">Rejoignez la communauté PodMatch</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("podcaster")}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              role === "podcaster"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Mic2 className="h-6 w-6 mb-2 text-primary" />
            <div className="font-semibold">Podcasteur</div>
            <div className="text-xs text-muted-foreground">Je cherche des invités</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("guest")}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              role === "guest"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Users className="h-6 w-6 mb-2 text-primary" />
            <div className="font-semibold">Expert</div>
            <div className="text-xs text-muted-foreground">Je veux être invité</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Nom d'affichage</Label>
            <Input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground border-0"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
