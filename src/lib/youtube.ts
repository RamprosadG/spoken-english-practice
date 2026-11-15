/**
 * The one place a YouTube address becomes a video id. Kept free of server and
 * Zod imports so the form modal, the thumbnail and the player all resolve a link
 * the same way the server validation does.
 */
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "www.youtu.be",
]);

/**
 * Reads the id out of `watch?v=`, `youtu.be/`, `embed/` and `shorts/` addresses.
 * Anything else — another host, a playlist without a video, a channel page — is
 * `null`, so an unsupported link is rejected before it is ever stored.
 */
export function parseYouTubeVideoId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  let candidate: string | null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = segments[0] ?? null;
  } else if (segments[0] === "watch") {
    candidate = url.searchParams.get("v");
  } else if (segments[0] === "embed" || segments[0] === "shorts") {
    candidate = segments[1] ?? null;
  } else {
    candidate = null;
  }

  return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

/** `hqdefault` exists for every uploaded video; `object-cover` crops its 4:3 bars. */
export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * The official embed player, so play/pause, volume, seeking, quality, speed,
 * captions and fullscreen are YouTube's own controls rather than a custom UI.
 */
export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`;
}