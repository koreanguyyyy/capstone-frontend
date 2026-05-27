interface Props {
  trackId: string;
  darkMode: boolean;
}

export default function SpotifyPlayer({ trackId, darkMode }: Props) {
  const theme = darkMode ? 0 : 1;

  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=${theme}`}
      width="100%"
      height="80"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-lg mt-2"
      title={`Spotify track ${trackId}`}
    />
  );
}

export function extractSpotifyTrackIds(text: string): string[] {
  const urls =
    text.match(/https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/g) ?? [];
  return urls.map((url) => url.split("/track/")[1]?.split("?")[0] ?? "").filter(Boolean);
}
