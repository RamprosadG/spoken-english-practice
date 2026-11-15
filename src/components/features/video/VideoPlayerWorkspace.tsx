"use client";

import { parseYouTubeVideoId, youTubeEmbedUrl } from "@/lib/youtube";

interface VideoPlayerWorkspaceProps {
  title: string;
  link: string;
  categoryName: string;
}

export function VideoPlayerWorkspace({
  title,
  link,
  categoryName,
}: VideoPlayerWorkspaceProps) {
  const videoId = parseYouTubeVideoId(link);

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-base font-semibold text-red-700">Invalid Video Link</p>
        <p className="mt-1 text-sm text-red-600">
          The video link for this entry is invalid or unsupported.
        </p>
      </div>
    );
  }

  const embedUrl = youTubeEmbedUrl(videoId);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 16:9 Responsive Video Player Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-slate-900/10">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      {/* Video Details Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            {categoryName}
          </span>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Source: YouTube
          </a>
        </div>
        <h2 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Watch directly inside the platform. Use the YouTube player controls to adjust playback speed, toggle captions, or switch to fullscreen.
        </p>
      </div>
    </div>
  );
}
