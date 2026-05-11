import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Mic, UserCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [stats, setStats] = useState<{ profiles: number; connections: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ count: profiles }, { count: connections }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "accepted"),
      ]);
      if (!cancelled) {
        setStats({ profiles: profiles ?? 0, connections: connections ?? 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative gradient-hero pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-6">
            <span className="h-1.5 w-1.5 rounded-full gradient-primary" />
            La plateforme #1 de mise en relation podcast
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight max-w-4xl mx-auto">
            Connectez podcasteurs et invités{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[hsl(280,70%,55%)]">
              en quelques clics
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez l'invité parfait pour votre podcast, ou partagez votre expertise en devenant invité. Simple, rapide, efficace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="gradient-primary shadow-button text-primary-foreground border-0 px-8 h-12 text-base" asChild>
            <Link to="/explore">
              <Mic className="mr-2 h-5 w-5" />
              Trouver un invité
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 h-12 text-base group" asChild>
            <Link to="/explore">
              <UserCheck className="mr-2 h-5 w-5" />
              Être interviewé
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {stats ? `${stats.profiles} profil${stats.profiles > 1 ? "s" : ""} inscrit${stats.profiles > 1 ? "s" : ""}` : "—"}
          </span>
          <span>•</span>
          <span>100% gratuit</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
