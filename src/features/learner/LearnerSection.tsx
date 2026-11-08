"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { confirmDelete } from "@/components/ui/modals/ConfirmModal";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type { LearnerFilters as LearnerFiltersState, LearnerItem } from "@/types/learner";
import { LearnerFilters } from "./LearnerFilters";
import { LearnerFormModal } from "./LearnerFormModal";
import { LearnerTable } from "./LearnerTable";
import { learnerRequest } from "./learner-client";

interface LearnerSectionProps {
  learners: LearnerItem[];
  pagination: PaginationMeta | null;
  filters: LearnerFiltersState;
  isLoading?: boolean;
}

// Filter and page state lives in the URL, so the list can be rendered on the
// server.
function toQuery(filters: LearnerFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.role) params.set("role", filters.role);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function LearnerSection({
  learners,
  pagination,
  filters,
  isLoading = false,
}: LearnerSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Saved records refetch on their own transition so the table keeps showing
  // rows while the modal is still open.
  const [, startRefresh] = useTransition();
  const [editingLearner, setEditingLearner] = useState<LearnerItem | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<LearnerFiltersState>) => {
    const query = toQuery({ ...filters, ...changes });
    // router.replace refetches even the URL already on screen, and the pending
    // transition blanks the table into the loader — so a change that writes
    // nothing new must never reach the router.
    if (query === requestedQuery.current) return;
    requestedQuery.current = query;

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const refresh = () => startRefresh(() => router.refresh());

  async function handleDelete(learner: LearnerItem) {
    const isConfirmed = await confirmDelete({
      title: "Delete Learner?",
      text: `"${learner.name}" will lose access to the app and their account will be permanently removed.`,
    });

    if (!isConfirmed) return;

    setDeletingId(learner.id);
    try {
      await learnerRequest<null>(`/api/learners/${learner.id}`, {
        method: "DELETE",
      });
      showSuccessAlert("Learner deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the learner. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <LearnerFilters
        search={filters.search}
        role={filters.role}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onRoleChange={(value) => navigate({ role: value, page: 1 })}
      />

      <LearnerTable
        learners={learners}
        isLoading={isLoading || isPending}
        deletingId={deletingId}
        onEdit={setEditingLearner}
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

      {editingLearner && (
        <LearnerFormModal
          learner={editingLearner}
          onClose={() => setEditingLearner(null)}
          onSaved={(message) => {
            setEditingLearner(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
