import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, Mic2 } from "lucide-react";

const navLinks = [
  { label: "Accueil", path: "/" as const },
  { label: "Explorer", path: "/explore" as const },
  { label: "Lieux", path: "/venues" as const },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
            <Mic2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">PodMatch</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/#how-it-works"
            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
          >
            Comment ça marche
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Connexion</Button>
          <Button size="sm" className="gradient-primary shadow-button text-primary-foreground border-0">
            Inscription
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-primary py-2"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-muted-foreground hover:text-primary py-2"
          >
            Comment ça marche
          </a>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">Connexion</Button>
            <Button size="sm" className="flex-1 gradient-primary shadow-button text-primary-foreground border-0">
              Inscription
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
