"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  SentenceFilters as SentenceFiltersState,
  SentenceItem,
} from "@/types/sentence";
import { SentenceFilters } from "./SentenceFilters";
import { SentenceFormModal } from "./SentenceFormModal";
import { SentenceTable } from "./SentenceTable";
import { sentenceRequest } from "./sentence-client";

interface SentenceSectionProps {
  sentences: SentenceItem[];
  pagination: PaginationMeta | null;
  filters: SentenceFiltersState;
  isLoading?: boolean;
}

export function SentenceSection({
  sentences,
  pagination,
  filters,
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

  const navigate = (changes: Partial<SentenceFiltersState>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
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
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
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
