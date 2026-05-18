import { Link } from "@tanstack/react-router";
import { Mic2 } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-secondary/50">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Mic2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">PodMatch</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            La plateforme qui connecte podcasteurs et invités.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Plateforme</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/explore" className="block hover:text-primary">Explorer</Link>
            <Link to="/venues" className="block hover:text-primary">Lieux</Link>
            <Link to="/auth/signup" className="block hover:text-primary">Inscription</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Ressources</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/blog" className="block hover:text-primary">Blog</Link>
            <Link to="/faq" className="block hover:text-primary">FAQ</Link>
            <Link to="/contact" className="block hover:text-primary">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Légal</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/privacy" className="block hover:text-primary">Confidentialité</Link>
            <Link to="/terms" className="block hover:text-primary">CGU</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PodMatch. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
