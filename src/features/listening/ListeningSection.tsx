"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
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

  // Filter and page state lives in the URL, so the library can be rendered on
  // the server.
  const navigate = (changes: Partial<ListeningFiltersState>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.category) params.set("category", next.category);
    if (next.status) params.set("status", next.status);
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
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
        `/api/listenings/${listening.id}`,
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
    const result = await Swal.fire({
      title: "Delete listening?",
      text: `"${listening.title}" and all of its sentences will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(listening.id);
    try {
      await listeningRequest<null>(`/api/listenings/${listening.id}`, {
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
