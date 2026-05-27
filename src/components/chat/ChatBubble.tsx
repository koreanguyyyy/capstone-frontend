import { Bot, ThumbsUp, ThumbsDown, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SpotifyPlayer, { extractSpotifyTrackIds } from "./SpotifyPlayer";
import { format, parseISO } from "date-fns";
import type { InterventionRating } from "@/types";

interface Props {
  message: string;
  timestamp: string;
  interventionId: number;
  onFeedback: (interventionId: number, rating: InterventionRating) => void;
  feedbackGiven: boolean;
  darkMode: boolean;
}

const URL_REGEX = /https?:\/\/[^\s]+/g;
const SPOTIFY_REGEX = /https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+(\?[^\s]*)?/g;

function renderMessageText(text: string) {
  const spotifyUrls = new Set(
    (text.match(SPOTIFY_REGEX) ?? []).map((u) => u.split("?")[0])
  );

  const parts = text.split(URL_REGEX);
  const urls = text.match(URL_REGEX) ?? [];

  const elements: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    elements.push(<span key={`t-${i}`}>{part}</span>);
    if (i < urls.length) {
      const url = urls[i];
      const baseUrl = url.split("?")[0];
      if (spotifyUrls.has(baseUrl)) {
        // Spotify URLs are rendered as embeds below — skip inline display
      } else {
        elements.push(
          <a
            key={`u-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 underline break-all"
          >
            {url}
          </a>
        );
      }
    }
  });

  return elements;
}

export default function ChatBubble({
  message,
  timestamp,
  interventionId,
  onFeedback,
  feedbackGiven,
  darkMode,
}: Props) {
  const spotifyIds = extractSpotifyTrackIds(message);
  let formattedTime: string;
  try {
    formattedTime = format(parseISO(timestamp), "HH:mm");
  } catch {
    formattedTime = "";
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex-1 space-y-2 max-w-[85%]">
        <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {renderMessageText(message)}
          </p>

          {spotifyIds.map((id) => (
            <SpotifyPlayer key={id} trackId={id} darkMode={darkMode} />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{formattedTime}</span>

          {feedbackGiven ? (
            <Badge variant="secondary" className="text-xs">
              피드백 감사합니다 😊
            </Badge>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onFeedback(interventionId, "HELPFUL")}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                도움이 됐어요
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onFeedback(interventionId, "UNNECESSARY")}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                별로예요
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onFeedback(interventionId, "ANNOYING")}
              >
                <SkipForward className="h-3.5 w-3.5 mr-1" />
                건너뛰기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
