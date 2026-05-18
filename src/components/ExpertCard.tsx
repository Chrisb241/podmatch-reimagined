import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ExpertWithProfile } from "@/lib/queries";
import { parseTopics } from "@/lib/topics";
import ContactExpertButton from "@/components/ContactExpertButton";

const ExpertCard = ({ expert }: { expert: ExpertWithProfile }) => {
  const name = expert.display_name ?? "Expert";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="group bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      <Link
        to="/profil/$id"
        params={{ id: expert.user_id }}
        className="block p-6 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            {expert.avatar_url ? (
              <img
                src={expert.avatar_url}
                alt={name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border font-semibold text-lg">
                {initial || <User className="h-5 w-5" />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-base truncate">{name}</h3>
            {expert.headline && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{expert.headline}</p>
            )}
            {expert.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {expert.location}
              </div>
            )}
          </div>
        </div>

        {expert.bio && (
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {expert.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {parseTopics(expert.expertise).map((topic) => (
            <Badge
              key={topic}
              variant="outline"
              className="text-[10px] bg-accent/50 border-accent text-accent-foreground"
            >
              {topic}
            </Badge>
          ))}
          {expert.languages?.map((lang) => (
            <Badge key={lang} variant="outline" className="text-[10px]">
              {lang}
            </Badge>
          ))}
        </div>
      </Link>

      <div className="px-6 pb-5">
        <ContactExpertButton expertId={expert.user_id} expertName={name} />
      </div>
    </div>
  );
};

export default ExpertCard;
