import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedProfiles from "@/components/FeaturedProfiles";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PodMatch — Connectez podcasteurs et invités" },
      { name: "description", content: "PodMatch met en relation podcasteurs et invités. Trouvez le match parfait pour votre prochain épisode." },
      { property: "og:title", content: "PodMatch — Connectez podcasteurs et invités" },
      { property: "og:description", content: "La plateforme #1 de mise en relation podcast." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturedProfiles />
      <CTASection />
      <Footer />
    </div>
  );
}
