"use client";

import Link from "next/link";
import Image from "next/image";
import { FiEdit, FiPlay, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { parseYouTubeVideoId, youTubeThumbnailUrl } from "@/lib/youtube";
import type { VideoItem } from "@/types/video";

interface VideoTableProps {
  videos: VideoItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
}

interface VideoCardProps {
  video: VideoItem;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
}

function SequenceLabel({
  sequence,
  className = "",
}: {
  sequence: number;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] font-semibold tracking-wider text-slate-400 tabular-nums ${className}`}
    >
      {`#${sequence}`}
    </span>
  );
}

/** One row of the video list, redrawn as a card for mobile width or admin card list. */
function VideoCard({
  video,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: VideoCardProps) {
  const videoId = parseYouTubeVideoId(video.link);
  const thumbnailUrl = videoId ? youTubeThumbnailUrl(videoId) : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={video.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{video.categoryName}</span>
        </p>
        {canManage && !video.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <div className="mt-3 flex gap-3">
        {thumbnailUrl && (
          <Link
            href={`/video/${video.slug}`}
            className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-900"
          >
            <Image
              src={thumbnailUrl}
              alt={video.title}
              fill
              sizes="128px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-indigo-600 shadow-md">
                <FiPlay className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </div>
            </div>
          </Link>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <Link
            href={`/video/${video.slug}`}
            className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-indigo-600"
          >
            {video.title}
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Link
          href={`/video/${video.slug}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlay className="h-3.5 w-3.5 fill-current" />
          Watch Video
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5">
            <TableActionButton
              tooltip="Update Video"
              color="blue"
              className="h-9 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onEdit(video)}
            >
              <FiEdit className="h-3.5 w-3.5" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete Video"
              color="rose"
              className="h-9 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isDeleting}
              onClick={() => onDelete(video)}
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Delete
            </TableActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function VideoTable({
  videos,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: VideoTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const columns: Column<VideoItem>[] = [
    {
      key: "title",
      header: "Title",
      className: "whitespace-normal",
      render: (video) => (
        <div className="min-w-[160px] max-w-sm whitespace-normal break-words">
          <SequenceLabel sequence={video.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/video/${video.slug}`}
              className="font-semibold text-slate-900 hover:text-indigo-600"
            >
              {video.title}
            </Link>
            {canManage && !video.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "video",
      header: "Video",
      render: (video) => {
        const videoId = parseYouTubeVideoId(video.link);
        const thumbnailUrl = videoId ? youTubeThumbnailUrl(videoId) : null;

        if (!thumbnailUrl) {
          return (
            <span className="text-xs text-slate-400">Invalid link</span>
          );
        }

        return (
          <Link
            href={`/video/${video.slug}`}
            className="group relative block h-14 w-24 shrink-0 overflow-hidden rounded-md bg-slate-900"
          >
            <Image
              src={thumbnailUrl}
              alt={video.title}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-indigo-600 shadow-xs">
                <FiPlay className="ml-0.5 h-3 w-3 fill-current" />
              </div>
            </div>
          </Link>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      render: (video) => (
        <Badge variant="neutral" size="sm">
          {video.categoryName}
        </Badge>
      ),
    },
    {
      key: "watch",
      header: "Watch",
      render: (video) => (
        <Link
          href={`/video/${video.slug}`}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlay className="h-3.5 w-3.5 fill-current" />
          Watch Video
        </Link>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (video) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit Video"
            color="blue"
            onClick={() => onEdit(video)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete Video"
            color="rose"
            isLoading={deletingId === video.id}
            onClick={() => onDelete(video)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={videos}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No videos found matching your search."
      renderCard={(video) => (
        <VideoCard
          video={video}
          canManage={canManage}
          isDeleting={deletingId === video.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
