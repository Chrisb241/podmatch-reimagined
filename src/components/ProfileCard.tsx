import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle2, Star, Wifi, Home, Car } from "lucide-react";
import type { UserProfile } from "@/data/mockData";

const availabilityIcons = {
  remote: { icon: Wifi, label: "À distance" },
  "in-person": { icon: Home, label: "Sur place" },
  travel: { icon: Car, label: "Déplacement" },
};

const ProfileCard = ({ profile }: { profile: UserProfile }) => (
  <div className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
          />
          {profile.verified && (
            <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-5 w-5 text-primary fill-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base truncate">{profile.name}</h3>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {profile.type === "podcaster" ? "Podcasteur" : "Invité"}
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {profile.location}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{profile.rating}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{profile.bio}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {profile.topics.map((topic) => (
          <Badge key={topic} variant="outline" className="text-[10px] bg-accent/50 border-accent text-accent-foreground">
            {topic}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
        {profile.availability.map((a) => {
          const { icon: Icon, label } = availabilityIcons[a];
          return (
            <span key={a} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {label}
            </span>
          );
        })}
      </div>
    </div>

    <div className="px-6 pb-5">
      <Button size="sm" className="w-full gradient-primary shadow-button text-primary-foreground border-0">
        Voir le profil
      </Button>
    </div>
  </div>
);

export default ProfileCard;
