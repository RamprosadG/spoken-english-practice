"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { showErrorAlert, showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Pagination from "@/components/ui/pagination/Pagination";
import type { PaginationMeta } from "@/server/types/pagination";
import type {
  ConversationDetailItem,
  ConversationFilters as ConversationFiltersState,
  ConversationItem,
} from "@/types/conversation";
import type { CategoryOption } from "@/types/category";
import { ConversationFilters } from "./ConversationFilters";
import { ConversationFormModal } from "./ConversationFormModal";
import { ConversationTable } from "./ConversationTable";
import { conversationRequest } from "./conversation-client";

interface ConversationSectionProps {
  conversations: ConversationItem[];
  pagination: PaginationMeta | null;
  filters: ConversationFiltersState;
  categories: CategoryOption[];
  isLoading?: boolean;
}

export function ConversationSection({
  conversations,
  pagination,
  filters,
  categories,
  isLoading = false,
}: ConversationSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // Saved records refetch on their own transition so the table keeps showing
  // rows while the modal is still open.
  const [, startRefresh] = useTransition();
  const [editingConversation, setEditingConversation] =
    useState<ConversationDetailItem | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and page state lives in the URL, so the library can be rendered on
  // the server.
  const navigate = (changes: Partial<ConversationFiltersState>) => {
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

  // The list rows carry no turns, so the saved lines are fetched before the
  // editor opens.
  async function handleEdit(conversation: ConversationItem) {
    if (loadingEditId) return;

    setLoadingEditId(conversation.id);
    try {
      const detail = await conversationRequest<ConversationDetailItem>(
        `/api/conversations/${conversation.id}`,
      );
      setEditingConversation(detail);
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to load the conversation. Please try again.",
      );
    } finally {
      setLoadingEditId(null);
    }
  }

  async function handleDelete(conversation: ConversationItem) {
    const result = await Swal.fire({
      title: "Delete conversation?",
      text: `"${conversation.title}" and all of its turns will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(conversation.id);
    try {
      await conversationRequest<null>(`/api/conversations/${conversation.id}`, {
        method: "DELETE",
      });
      showSuccessAlert("Conversation deleted successfully.");
      refresh();
    } catch (error) {
      showErrorAlert(
        error instanceof Error
          ? error.message
          : "Failed to delete the conversation. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <ConversationFilters
        search={filters.search}
        category={filters.category}
        status={filters.status}
        categories={categories}
        onSearchChange={(value) => navigate({ search: value, page: 1 })}
        onCategoryChange={(value) => navigate({ category: value, page: 1 })}
        onStatusChange={(value) => navigate({ status: value, page: 1 })}
      />

      <ConversationTable
        conversations={conversations}
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

      {editingConversation && (
        <ConversationFormModal
          conversation={editingConversation}
          categories={categories}
          defaultSequence={editingConversation.sequence}
          onClose={() => setEditingConversation(null)}
          onSaved={(message) => {
            setEditingConversation(null);
            showSuccessAlert(message);
            refresh();
          }}
        />
      )}
    </>
  );
}
