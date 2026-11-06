"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  showErrorAlert,
  showSuccessAlert,
} from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type { CategoryOption } from "@/types/category";
import type {
  InterviewQuestionFilters as InterviewQuestionFiltersState,
  InterviewQuestionItem,
} from "@/types/interview-question";
import { InterviewQuestionFilters } from "./InterviewQuestionFilters";
import { InterviewQuestionFormModal } from "./InterviewQuestionFormModal";
import { InterviewQuestionTable } from "./InterviewQuestionTable";
import { interviewQuestionRequest } from "./interview-question-client";

interface InterviewQuestionSectionProps {
  questions: InterviewQuestionItem[];
  pagination: PaginationMeta | null;
  filters: InterviewQuestionFiltersState;
  categories: CategoryOption[];
  topics: CategoryOption[];
  isLoading?: boolean;
}

// Filter and page state lives in the URL, so the library can be rendered on
// the server.
function toQuery(filters: InterviewQuestionFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function InterviewQuestionSection({
  questions,
  pagination,
  filters,
  categories,
  topics,
  isLoading = false,
}: InterviewQuestionSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Saved records refetch on their own transition so the table keeps showing
  // rows while the modal is still open.
  const [, startRefresh] = useTransition();
  const [editingQuestion, setEditingQuestion] =
    useState<InterviewQuestionItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<InterviewQuestionFiltersState>) => {
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

  async function handleDelete(question: InterviewQuestionItem) {
    const result = await Swal.fire({
      title: "Delete interview question?",
      text: `"${question.question}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(question.id);
    try {
      await interviewQuestionRequest<null>(
        `/api/interview-questions/${question.id}`,
        { method: "DELETE" },
      );
      showSuccessAlert("Interview question deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the interview question. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <InterviewQuestionFilters
        search={filters.search}
        category={filters.category}
        topic={filters.topic}
        difficulty={filters.difficulty}
        status={filters.status}
        categories={categories}
        topics={topics}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onCategoryChange={(value) => navigate({ category: value, page: 1 })}
        onTopicChange={(value) => navigate({ topic: value, page: 1 })}
        onDifficultyChange={(value) => navigate({ difficulty: value, page: 1 })}
        onStatusChange={(value) => navigate({ status: value, page: 1 })}
      />

      <InterviewQuestionTable
        questions={questions}
        isLoading={isLoading || isPending}
        deletingId={deletingId}
        onEdit={setEditingQuestion}
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

      {editingQuestion && (
        <InterviewQuestionFormModal
          question={editingQuestion}
          categories={categories}
          topics={topics}
          defaultSequence={editingQuestion.sequence}
          onClose={() => setEditingQuestion(null)}
          onSaved={(message) => {
            setEditingQuestion(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
