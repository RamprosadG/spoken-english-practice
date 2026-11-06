"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  VocabularyFilters as VocabularyFiltersState,
  VocabularyItem,
} from "@/types/vocabulary";
import type { CategoryOption } from "@/types/category";
import { VocabularyFilters } from "./VocabularyFilters";
import { VocabularyFormModal } from "./VocabularyFormModal";
import { VocabularyTable } from "./VocabularyTable";
import { vocabularyRequest } from "./vocabulary-client";

interface VocabularySectionProps {
  vocabularies: VocabularyItem[];
  pagination: PaginationMeta | null;
  filters: VocabularyFiltersState;
  categories: CategoryOption[];
  isLoading?: boolean;
}

// Filter and page state lives in the URL, so the library can be rendered on
// the server.
function toQuery(filters: VocabularyFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.letter) params.set("letter", filters.letter);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function VocabularySection({
  vocabularies,
  pagination,
  filters,
  categories,
  isLoading = false,
}: VocabularySectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [, startRefresh] = useTransition();
  // Only one row can be open at a time; a single id is the whole state.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingVocabulary, setEditingVocabulary] =
    useState<VocabularyItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<VocabularyFiltersState>) => {
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

  function handleTogglePractice(vocabulary: VocabularyItem) {
    setExpandedId((current) =>
      current === vocabulary.id ? null : vocabulary.id,
    );
  }

  async function handleDelete(vocabulary: VocabularyItem) {
    const result = await Swal.fire({
      title: "Delete vocabulary?",
      text: `"${vocabulary.text}" and all of its synonyms and antonyms will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(vocabulary.id);
    try {
      await vocabularyRequest<null>(`/api/vocabulary/${vocabulary.id}`, {
        method: "DELETE",
      });
      if (expandedId === vocabulary.id) {
        setExpandedId(null);
      }
      showSuccessAlert("Vocabulary deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the vocabulary. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <VocabularyFilters
        search={filters.search}
        category={filters.category}
        letter={filters.letter}
        status={filters.status}
        categories={categories}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onCategoryChange={(value) => navigate({ category: value, page: 1 })}
        onLetterChange={(value) => navigate({ letter: value, page: 1 })}
        onStatusChange={(value) => navigate({ status: value, page: 1 })}
      />

      <VocabularyTable
        vocabularies={vocabularies}
        isLoading={isLoading || isPending}
        deletingId={deletingId}
        expandedId={expandedId}
        onTogglePractice={handleTogglePractice}
        onEdit={setEditingVocabulary}
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

      {editingVocabulary && (
        <VocabularyFormModal
          vocabulary={editingVocabulary}
          categories={categories}
          defaultSequence={editingVocabulary.sequence}
          onClose={() => setEditingVocabulary(null)}
          onSaved={(message) => {
            setEditingVocabulary(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
