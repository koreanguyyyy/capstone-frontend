import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, BookOpen, MapPin, Film } from "lucide-react";
import type { Recommendation } from "@/types";

const CATEGORY_ICON: Record<string, typeof Music> = {
  MUSIC: Music,
  BOOK: BookOpen,
  PLACE: MapPin,
  MOVIE: Film,
};

const CATEGORY_LABEL: Record<string, string> = {
  MUSIC: "음악",
  BOOK: "도서",
  PLACE: "장소",
  MOVIE: "영화",
};

interface Props {
  rec: Recommendation;
}

export default function RecommendationCard({ rec }: Props) {
  const Icon = CATEGORY_ICON[rec.category] ?? Music;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Icon className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABEL[rec.category] ?? rec.category}
            </Badge>
            {rec.userFeedback && (
              <Badge
                variant={rec.userFeedback === "LIKED" ? "default" : "outline"}
                className="text-xs"
              >
                {rec.userFeedback === "LIKED"
                  ? "좋아요"
                  : rec.userFeedback === "DISLIKED"
                    ? "싫어요"
                    : "건너뜀"}
              </Badge>
            )}
          </div>
          <p className="font-medium text-sm truncate">{rec.title}</p>
          {rec.artistOrAuthor && (
            <p className="text-xs text-muted-foreground truncate">
              {rec.artistOrAuthor}
            </p>
          )}
          {rec.reason && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {rec.reason}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
