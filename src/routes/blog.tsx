import { createFileRoute, Link } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — PodMatch" },
      { name: "description", content: "Conseils, interviews et actualités pour les podcasteurs et invités." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex-1">
        <h1 className="font-display font-bold text-4xl md:text-5xl">Blog</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Nos articles arrivent bientôt. En attendant, explorez la plateforme.
        </p>
        <Link to="/explore" className="inline-block mt-8 text-primary hover:underline">
          Explorer les profils →
        </Link>
      </main>
      <Footer />
    </div>
  );
}
