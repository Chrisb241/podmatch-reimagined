import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PodMatch" },
      { name: "description", content: "Contactez l'équipe PodMatch." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex-1 max-w-2xl">
        <h1 className="font-display font-bold text-4xl md:text-5xl">Contact</h1>
        <p className="mt-4 text-muted-foreground">
          Une question ? Un partenariat ? Écrivez-nous.
        </p>
        <a
          href="mailto:hello@podmatch.app"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground"
        >
          <Mail className="h-4 w-4" /> hello@podmatch.app
        </a>
      </main>
      <Footer />
    </div>
  );
}
