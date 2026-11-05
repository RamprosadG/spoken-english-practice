"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  SentenceFilters as SentenceFiltersState,
  SentenceItem,
} from "@/types/sentence";
import type { CategoryOption } from "@/types/category";
import { SentenceFilters } from "./SentenceFilters";
import { SentenceFormModal } from "./SentenceFormModal";
import { SentenceTable } from "./SentenceTable";
import { sentenceRequest } from "./sentence-client";

interface SentenceSectionProps {
  sentences: SentenceItem[];
  pagination: PaginationMeta | null;
  filters: SentenceFiltersState;
  categories: CategoryOption[];
  isLoading?: boolean;
}

// Filter and page state lives in the URL, so the library can be rendered on
// the server.
function toQuery(filters: SentenceFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function SentenceSection({
  sentences,
  pagination,
  filters,
  categories,
  isLoading = false,
}: SentenceSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [, startRefresh] = useTransition();
  // Only one row can be open at a time; a single id is the whole state.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSentence, setEditingSentence] = useState<SentenceItem | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<SentenceFiltersState>) => {
    const query = toQuery({ ...filters, ...changes });
    // router.replace refetches even the URL already on screen, and the pending
    // transition blanks the table into the loader — so a change that writes
    // nothing new (SearchInput's mount emit under StrictMode, a re-picked
    // option) must never reach the router.
    if (query === requestedQuery.current) return;
    requestedQuery.current = query;

    setExpandedId(null);
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  function handleTogglePractice(sentence: SentenceItem) {
    setExpandedId((current) =>
      current === sentence.id ? null : sentence.id,
    );
  }

  async function handleDelete(sentence: SentenceItem) {
    const result = await Swal.fire({
      title: "Delete sentence?",
      text: `"${sentence.text}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(sentence.id);
    try {
      await sentenceRequest<null>(`/api/sentences/${sentence.id}`, {
        method: "DELETE",
      });
      if (expandedId === sentence.id) {
        setExpandedId(null);
      }
      showSuccessAlert("Sentence deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the sentence. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <SentenceFilters
        search={filters.search}
        category={filters.category}
        status={filters.status}
        categories={categories}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onCategoryChange={(value) => navigate({ category: value, page: 1 })}
        onStatusChange={(value) => navigate({ status: value, page: 1 })}
      />

      <SentenceTable
        sentences={sentences}
        isLoading={isLoading || isPending}
        deletingId={deletingId}
        expandedId={expandedId}
        onTogglePractice={handleTogglePractice}
        onEdit={setEditingSentence}
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

      {editingSentence && (
        <SentenceFormModal
          sentence={editingSentence}
          categories={categories}
          defaultSequence={editingSentence.sequence}
          onClose={() => setEditingSentence(null)}
          onSaved={(message) => {
            setEditingSentence(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
