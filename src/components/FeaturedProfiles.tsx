import ProfileCard from "./ProfileCard";
import { mockProfiles } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

const FeaturedProfiles = () => (
  <section className="py-20 md:py-28 bg-secondary/30">
    <div className="container mx-auto px-4">
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Profils en vedette</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">Découvrez nos membres</h2>
        </div>
        <Button variant="ghost" className="hidden md:flex text-primary" asChild>
          <Link to="/explore">
            Voir tous <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProfiles.slice(0, 6).map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <ProfileCard profile={profile} />
          </motion.div>
        ))}
      </div>
      <div className="md:hidden text-center mt-8">
        <Button variant="outline" asChild>
          <Link to="/explore">Voir tous les profils <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  </section>
);

export default FeaturedProfiles;
