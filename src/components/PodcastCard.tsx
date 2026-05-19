import { Button } from "@/components/ui/button";
import { Mic, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PodcastWithOwner } from "@/lib/queries";

const PodcastCard = ({ podcast }: { podcast: PodcastWithOwner }) => (
  <div className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
    <Link
      to="/profil/$id"
      params={{ id: podcast.owner_id }}
      className="block"
    >
      <div className="aspect-video bg-secondary relative overflow-hidden">
        {podcast.cover_url ? (
          <img
            src={podcast.cover_url}
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/30">
            <Mic className="h-12 w-12 text-primary/40" />
          </div>
        )}
      </div>
      <div className="p-5 pb-3">
        <h3 className="font-display font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
          {podcast.title}
        </h3>
        {podcast.owner_display_name && (
          <p className="text-xs text-muted-foreground mt-1">par {podcast.owner_display_name}</p>
        )}
        {podcast.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {podcast.description}
          </p>
        )}
      </div>
    </Link>
    {podcast.website_url && (
      <div className="px-5 pb-5">
        <Button size="sm" variant="outline" className="w-full" asChild>
          <a href={podcast.website_url} target="_blank" rel="noopener noreferrer">
            Visiter <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    )}
  </div>
);

export default PodcastCard;
