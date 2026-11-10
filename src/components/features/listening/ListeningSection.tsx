"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { confirmDelete } from "@/components/ui/modals/ConfirmModal";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption } from "@/types/category";
import type {
  Listening,
  ListeningDetail,
  ListeningFilters as ListeningFiltersState,
} from "@/types/listening";
import { ListeningFilters } from "./ListeningFilters";
import { ListeningFormModal } from "./ListeningFormModal";
import { ListeningTable } from "./ListeningTable";
import { listeningRequest } from "./listening-client";

interface ListeningSectionProps {
  listenings: Listening[];
  pagination: PaginationMeta | null;
  filters: ListeningFiltersState;
  categories: CategoryOption[];
  isLoading?: boolean;
}

// Filter and page state lives in the URL, so the library can be rendered on
// the server.
function toQuery(filters: ListeningFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function ListeningSection({
  listenings,
  pagination,
  filters,
  categories,
  isLoading = false,
}: ListeningSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Saved records refetch on their own transition so the table keeps showing
  // rows while the modal is still open.
  const [, startRefresh] = useTransition();
  const [editingListening, setEditingListening] =
    useState<ListeningDetail | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<ListeningFiltersState>) => {
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

  // The list rows carry no sentences, so the saved items are fetched before the
  // editor opens.
  async function handleEdit(listening: Listening) {
    if (loadingEditId) return;

    setLoadingEditId(listening.id);
    try {
      const detail = await listeningRequest<ListeningDetail>(
        `/api/listening/${listening.id}`,
      );
      setEditingListening(detail);
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to load the listening. Please try again.",
      );
    } finally {
      setLoadingEditId(null);
    }
  }

  async function handleDelete(listening: Listening) {
    const isConfirmed = await confirmDelete({
      title: "Delete Listening?",
      text: `"${listening.title}" and all of its sentences will be permanently removed.`,
    });

    if (!isConfirmed) return;

    setDeletingId(listening.id);
    try {
      await listeningRequest<null>(`/api/listening/${listening.id}`, {
        method: "DELETE",
      });
      showSuccessAlert("Listening deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the listening. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <ListeningFilters
        search={filters.search}
        category={filters.category}
        status={filters.status}
        categories={categories}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onCategoryChange={(value) => navigate({ category: value, page: 1 })}
        onStatusChange={(value) => navigate({ status: value, page: 1 })}
      />

      <ListeningTable
        listenings={listenings}
        isLoading={isLoading || isPending}
        deletingId={deletingId}
        loadingEditId={loadingEditId}
        onEdit={handleEdit}
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

      {editingListening && (
        <ListeningFormModal
          listening={editingListening}
          categories={categories}
          defaultSequence={editingListening.sequence}
          onClose={() => setEditingListening(null)}
          onSaved={(message) => {
            setEditingListening(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
