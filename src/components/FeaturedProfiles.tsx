import { useEffect, useState } from "react";
import ExpertCard from "./ExpertCard";
import { fetchExperts, type ExpertWithProfile } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

const FeaturedProfiles = () => {
  const [experts, setExperts] = useState<ExpertWithProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchExperts()
      .then((d) => {
        if (!cancelled) setExperts(d);
      })
      .catch(() => {
        if (!cancelled) setExperts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = (experts ?? []).slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              Profils en vedette
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">
              Découvrez nos experts
            </h2>
          </div>
          {visible.length > 0 && (
            <Button variant="ghost" className="hidden md:flex text-primary" asChild>
              <Link to="/explore">
                Voir tous <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Chargement...
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
            <p className="text-lg">Aucun profil pour le moment</p>
            <p className="text-sm mt-1">Soyez le premier à rejoindre la communauté.</p>
            <Button className="mt-6 gradient-primary text-primary-foreground border-0" asChild>
              <Link to="/auth/signup">Créer mon profil</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((expert, i) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <ExpertCard expert={expert} />
                </motion.div>
              ))}
            </div>
            <div className="md:hidden text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/explore">
                  Voir tous les profils <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProfiles;
