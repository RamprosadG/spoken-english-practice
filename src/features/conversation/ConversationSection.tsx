"use client";

import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { confirmDelete } from "@/components/ui/modals/ConfirmModal";
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

// Filter and page state lives in the URL, so the library can be rendered on
// the server.
function toQuery(filters: ConversationFiltersState) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
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
  const requestedQuery = useRef(toQuery(filters));

  const navigate = (changes: Partial<ConversationFiltersState>) => {
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
    const isConfirmed = await confirmDelete({
      title: "Delete Conversation?",
      text: `"${conversation.title}" and all of its turns will be permanently removed.`,
    });

    if (!isConfirmed) return;

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
