import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

const CTASection = () => (
  <section className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl gradient-primary p-10 md:p-16 text-center overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground">
            Prêt à lancer votre prochain épisode ?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
            Rejoignez des milliers de podcasteurs et invités qui utilisent PodMatch pour créer du contenu exceptionnel.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="px-8 h-12" asChild>
              <Link to="/auth/signup">
                Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
