"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  VocabularyFilters as VocabularyFiltersState,
  VocabularyItem,
} from "@/types/vocabulary";
import { VocabularyFilters } from "./VocabularyFilters";
import { VocabularyFormModal } from "./VocabularyFormModal";
import { VocabularyTable } from "./VocabularyTable";
import { vocabularyRequest } from "./vocabulary-client";

interface VocabularySectionProps {
  vocabularies: VocabularyItem[];
  pagination: PaginationMeta | null;
  filters: VocabularyFiltersState;
  isLoading?: boolean;
}

export function VocabularySection({
  vocabularies,
  pagination,
  filters,
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

  const navigate = (changes: Partial<VocabularyFiltersState>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.letter) params.set("letter", next.letter);
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
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
      text: `"${vocabulary.text}" will be permanently removed.`,
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
        letter={filters.letter}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onLetterChange={(value) => navigate({ letter: value, page: 1 })}
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
