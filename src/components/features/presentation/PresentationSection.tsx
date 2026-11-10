"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { confirmDelete } from "@/components/ui/modals/ConfirmModal";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  PresentationFilters as PresentationFiltersState,
  PresentationItem,
} from "@/types/presentation";
import type { CategoryOption } from "@/types/category";
import { PresentationFilters } from "./PresentationFilters";
import { PresentationFormModal } from "./PresentationFormModal";
import { PresentationTable } from "./PresentationTable";
import { presentationRequest } from "./presentation-client";

interface PresentationSectionProps {
  presentations: PresentationItem[];
  pagination: PaginationMeta | null;
  filters: PresentationFiltersState;
  categories: CategoryOption[];
  isLoading?: boolean;
}

// Filter and page state lives in the URL, so the library can be rendered on
// the server.
function toQuery(filters: PresentationFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function PresentationSection({
  presentations,
  pagination,
  filters,
  categories,
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
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<PresentationFiltersState>) => {
    const query = toQuery({ ...filters, ...changes });
    // router.replace refetches even the URL already on screen, and the pending
    // transition blanks the table into the loader — so a change that writes
    // nothing new (SearchInput's mount emit under StrictMode, a re-picked
    // option) must never reach the router.
    if (query === requestedQuery.current) return;
    requestedQuery.current = query;

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  async function handleDelete(presentation: PresentationItem) {
    const isConfirmed = await confirmDelete({
      title: "Delete Presentation?",
      text: `"${presentation.title}" will be permanently removed.`,
    });

    if (!isConfirmed) return;

    setDeletingId(presentation.id);
    try {
      await presentationRequest<null>(`/api/presentation/${presentation.id}`, {
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
        category={filters.category}
        status={filters.status}
        categories={categories}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onCategoryChange={(value) => navigate({ category: value, page: 1 })}
        onStatusChange={(value) => navigate({ status: value, page: 1 })}
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
          categories={categories}
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
