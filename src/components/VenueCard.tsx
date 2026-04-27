import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import type { Venue } from "@/data/mockData";

const VenueCard = ({ venue }: { venue: Venue }) => (
  <div className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
    <div className="relative overflow-hidden">
      <img
        src={venue.image}
        alt={venue.name}
        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm border-0 text-[10px]">
        {venue.type}
      </Badge>
      <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold">
        {venue.price}
      </span>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-display font-semibold text-base">{venue.name}</h3>
        <span className="flex items-center gap-1 text-xs font-medium">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {venue.rating}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        {venue.city}
      </div>
      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{venue.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {venue.amenities.slice(0, 4).map((a) => (
          <Badge key={a} variant="outline" className="text-[10px] bg-accent/50 border-accent text-accent-foreground">
            {a}
          </Badge>
        ))}
      </div>
      <Button size="sm" variant="outline" className="w-full mt-4">
        Voir le lieu
      </Button>
    </div>
  </div>
);

export default VenueCard;
