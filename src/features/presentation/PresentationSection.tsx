"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  PresentationFilters as PresentationFiltersState,
  PresentationItem,
} from "@/types/presentation";
import { PresentationFilters } from "./PresentationFilters";
import { PresentationFormModal } from "./PresentationFormModal";
import { PresentationTable } from "./PresentationTable";
import { presentationRequest } from "./presentation-client";

interface PresentationSectionProps {
  presentations: PresentationItem[];
  pagination: PaginationMeta | null;
  filters: PresentationFiltersState;
  isLoading?: boolean;
}

export function PresentationSection({
  presentations,
  pagination,
  filters,
  isLoading = false,
}: PresentationSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Saved records refetch on their own transition so the table keeps showing
  // rows while the modal is still open.
  const [, startRefresh] = useTransition();
  const [editingPresentation, setEditingPresentation] =
    useState<PresentationItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and page state lives in the URL, so the library can be rendered on
  // the server.
  const navigate = (changes: Partial<PresentationFiltersState>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  async function handleDelete(presentation: PresentationItem) {
    const result = await Swal.fire({
      title: "Delete presentation?",
      text: `"${presentation.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(presentation.id);
    try {
      await presentationRequest<null>(`/api/presentations/${presentation.id}`, {
        method: "DELETE",
      });
      showSuccessAlert("Presentation deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the presentation. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PresentationFilters
        search={filters.search}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
      />

      <PresentationTable
        presentations={presentations}
        isLoading={isLoading || isPending}
        deletingId={deletingId}
        onEdit={setEditingPresentation}
        onDelete={handleDelete}
      />

      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => navigate({ page })}
          total={pagination.total}
          limit={pagination.pageSize}
        />
      )}

      {editingPresentation && (
        <PresentationFormModal
          presentation={editingPresentation}
          defaultSequence={editingPresentation.sequence}
          onClose={() => setEditingPresentation(null)}
          onSaved={(message) => {
            setEditingPresentation(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
