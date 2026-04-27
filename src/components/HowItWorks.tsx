import { UserPlus, Search, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: UserPlus,
    title: "Créez votre profil",
    description: "Inscrivez-vous en tant que podcasteur ou invité. Ajoutez vos thématiques, bio et disponibilités.",
  },
  {
    icon: Search,
    title: "Trouvez le match parfait",
    description: "Utilisez nos filtres avancés et suggestions intelligentes pour trouver la personne idéale.",
  },
  {
    icon: MessageCircle,
    title: "Connectez-vous & enregistrez",
    description: "Échangez via le chat intégré, trouvez un lieu et lancez l'interview.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold text-primary uppercase tracking-widest">Comment ça marche</span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">Trois étapes simples</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center"
          >
            <div className="mx-auto h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary">Étape {i + 1}</span>
            <h3 className="font-display font-semibold text-lg mt-1 mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
