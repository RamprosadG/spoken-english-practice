"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import { SPEAKER_BADGE_VARIANTS } from "./speakerStyles";
import type { ConversationItem } from "@/types/conversation";

const DESCRIPTION_PREVIEW_LENGTH = 60;

function truncateDescription(description: string) {
  return description.length > DESCRIPTION_PREVIEW_LENGTH
    ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
    : description;
}

interface ConversationTableProps {
  conversations: ConversationItem[];
  isLoading: boolean;
  deletingId: string | null;
  loadingEditId: string | null;
  onEdit: (conversation: ConversationItem) => void;
  onDelete: (conversation: ConversationItem) => void;
}

export function ConversationTable({
  conversations,
  isLoading,
  deletingId,
  loadingEditId,
  onEdit,
  onDelete,
}: ConversationTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const columns: Column<ConversationItem>[] = [
    {
      key: "conversation",
      header: "Conversation",
      className: "whitespace-normal",
      render: (conversation) => (
        <div className="max-w-[240px] whitespace-normal break-words sm:max-w-md">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{conversation.title}</p>
            {canManage && !conversation.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {conversation.categoryName}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {truncateDescription(conversation.description)}
          </p>
        </div>
      ),
    },
    {
      key: "speakers",
      header: "Speakers",
      render: (conversation) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={SPEAKER_BADGE_VARIANTS.one} size="sm">
            {conversation.speaker1}
          </Badge>
          <Badge variant={SPEAKER_BADGE_VARIANTS.two} size="sm">
            {conversation.speaker2}
          </Badge>
        </div>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (conversation) => (
        <Link
          href={`/conversations/${conversation.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice now
        </Link>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (conversation) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit conversation"
            color="blue"
            isLoading={loadingEditId === conversation.id}
            onClick={() => onEdit(conversation)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete conversation"
            color="rose"
            isLoading={deletingId === conversation.id}
            onClick={() => onDelete(conversation)}
          >
            <FiTrash2 className="w-4 w-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={conversations}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No conversations found matching your search."
    />
  );
}
