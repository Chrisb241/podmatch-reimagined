import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — PodMatch" },
      { name: "description", content: "Réponses aux questions fréquentes sur PodMatch." },
    ],
  }),
  component: FaqPage,
});

const QA = [
  { q: "PodMatch est-il gratuit ?", a: "Oui, l'inscription et la mise en relation de base sont 100% gratuites." },
  { q: "Comment contacter un invité ?", a: "Créez un compte podcasteur, explorez les experts puis envoyez une demande de contact depuis leur profil." },
  { q: "Comment devenir invité ?", a: "Inscrivez-vous comme invité, complétez votre profil expert avec vos thématiques et votre bio." },
  { q: "Puis-je réserver un studio ?", a: "Oui, la section Lieux liste des studios, espaces de coworking et salles d'événement." },
];

function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex-1 max-w-3xl">
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-8">FAQ</h1>
        <Accordion type="single" collapsible>
          {QA.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
}
