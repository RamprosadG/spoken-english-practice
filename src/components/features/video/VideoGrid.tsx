"use client";

import Link from "next/link";
import Image from "next/image";
import { FiEdit, FiPlay, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { parseYouTubeVideoId, youTubeThumbnailUrl } from "@/lib/youtube";
import type { VideoItem } from "@/types/video";

interface VideoGridProps {
  videos: VideoItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
}

export function VideoGrid({
  videos,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: VideoGridProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs animate-pulse"
          >
            <div className="aspect-video w-full rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-xs">
        <p className="text-sm font-medium text-slate-900">No videos found.</p>
        <p className="mt-1 text-xs text-slate-500">
          Try adjusting your search or category filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => {
        const videoId = parseYouTubeVideoId(video.link);
        const thumbnailUrl = videoId ? youTubeThumbnailUrl(videoId) : null;
        const isDeleting = deletingId === video.id;

        return (
          <div
            key={video.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            {/* Thumbnail Header with Play Overlay */}
            <Link
              href={`/video/${video.slug}`}
              className="relative aspect-video w-full overflow-hidden bg-slate-950"
            >
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs text-slate-400">
                  No Thumbnail
                </div>
              )}
              {/* Overlay with Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-lg transition-transform duration-200 group-hover:scale-110">
                  <FiPlay className="ml-1 h-5 w-5 fill-current" />
                </div>
              </div>

              {/* Status and sequence badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                  #{video.sequence}
                </span>
                {canManage && !video.isPublished && (
                  <Badge variant="warning" size="sm">
                    Draft
                  </Badge>
                )}
              </div>
            </Link>

            {/* Video Meta Body */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="neutral" size="sm">
                    {video.categoryName}
                  </Badge>
                </div>
                <h3 className="mt-2 text-base font-semibold text-slate-900 group-hover:text-indigo-600">
                  <Link href={`/video/${video.slug}`} className="line-clamp-2">
                    {video.title}
                  </Link>
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Link
                  href={`/video/${video.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  <FiPlay className="h-3.5 w-3.5 fill-current" />
                  Watch Video
                </Link>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <TableActionButton
                      tooltip="Edit Video"
                      color="blue"
                      onClick={() => onEdit(video)}
                    >
                      <FiEdit className="h-3.5 w-3.5" />
                    </TableActionButton>
                    <TableActionButton
                      tooltip="Delete Video"
                      color="rose"
                      isLoading={isDeleting}
                      onClick={() => onDelete(video)}
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </TableActionButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
