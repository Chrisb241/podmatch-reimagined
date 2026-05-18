import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "CGU — PodMatch" },
      { name: "description", content: "Conditions générales d'utilisation de PodMatch." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex-1 max-w-3xl">
        <h1 className="font-display font-bold text-4xl md:text-5xl">Conditions générales d'utilisation</h1>
        <p className="mt-6 text-muted-foreground">
          En utilisant PodMatch, vous acceptez d'utiliser la plateforme de manière respectueuse
          envers les autres membres. Tout comportement abusif, spam ou contenu illégal entraînera
          la suspension du compte.
        </p>
        <p className="mt-4 text-muted-foreground">
          PodMatch est fourni "tel quel" sans garantie. Nous nous réservons le droit de modifier
          ces conditions à tout moment.
        </p>
      </main>
      <Footer />
    </div>
  );
}
