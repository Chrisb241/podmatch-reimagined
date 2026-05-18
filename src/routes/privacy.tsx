import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — PodMatch" },
      { name: "description", content: "Politique de confidentialité de PodMatch." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex-1 max-w-3xl prose prose-neutral dark:prose-invert">
        <h1 className="font-display font-bold text-4xl md:text-5xl">Confidentialité</h1>
        <p className="mt-6 text-muted-foreground">
          PodMatch respecte votre vie privée. Nous collectons uniquement les données nécessaires
          au fonctionnement du service (compte, profil, demandes de contact, messages) et ne les
          revendons à aucun tiers. Vous pouvez demander la suppression de votre compte à tout
          moment.
        </p>
        <p className="mt-4 text-muted-foreground">
          Pour toute question relative à vos données : hello@podmatch.app
        </p>
      </main>
      <Footer />
    </div>
  );
}
