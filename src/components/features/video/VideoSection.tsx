"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiGrid, FiList } from "react-icons/fi";
import { confirmDelete } from "@/components/ui/modals/ConfirmModal";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import { useAuth } from "@/components/features/auth/AuthProvider";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  VideoFilters as VideoFiltersState,
  VideoItem,
} from "@/types/video";
import type { CategoryOption } from "@/types/category";
import { VideoFilters } from "./VideoFilters";
import { VideoFormModal } from "./VideoFormModal";
import { VideoTable } from "./VideoTable";
import { VideoGrid } from "./VideoGrid";
import { videoRequest } from "./video-client";

interface VideoSectionProps {
  videos: VideoItem[];
  pagination: PaginationMeta | null;
  filters: VideoFiltersState;
  categories: CategoryOption[];
  isLoading?: boolean;
}

function toQuery(filters: VideoFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function VideoSection({
  videos,
  pagination,
  filters,
  categories,
  isLoading = false,
}: VideoSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [isPending, startTransition] = useTransition();
  const [, startRefresh] = useTransition();
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Default to grid for public visitors, or allow toggling view mode
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<VideoFiltersState>) => {
    const query = toQuery({ ...filters, ...changes });
    if (query === requestedQuery.current) return;
    requestedQuery.current = query;

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  async function handleDelete(video: VideoItem) {
    const isConfirmed = await confirmDelete({
      title: "Delete Video?",
      text: `"${video.title}" will be permanently removed.`,
    });

    if (!isConfirmed) return;

    setDeletingId(video.id);
    try {
      await videoRequest<null>(`/api/video/${video.id}`, {
        method: "DELETE",
      });
      showSuccessAlert("Video deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the video. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <VideoFilters
              search={filters.search}
              category={filters.category}
              status={filters.status}
              categories={categories}
              onSearchChange={(value) => navigate({ search: value, page: 1 })}
              onCategoryChange={(value) => navigate({ category: value, page: 1 })}
              onStatusChange={(value) => navigate({ status: value, page: 1 })}
            />
          </div>

          {/* View switcher (Grid vs Table) */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FiGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FiList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <VideoGrid
          videos={videos}
          isLoading={isLoading || isPending}
          deletingId={deletingId}
          onEdit={setEditingVideo}
          onDelete={handleDelete}
        />
      ) : (
        <VideoTable
          videos={videos}
          isLoading={isLoading || isPending}
          deletingId={deletingId}
          onEdit={setEditingVideo}
          onDelete={handleDelete}
        />
      )}

      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => navigate({ page })}
          total={pagination.total}
          limit={pagination.pageSize}
        />
      )}

      {editingVideo && (
        <VideoFormModal
          video={editingVideo}
          categories={categories}
          defaultSequence={editingVideo.sequence}
          onClose={() => setEditingVideo(null)}
          onSaved={(message) => {
            setEditingVideo(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
