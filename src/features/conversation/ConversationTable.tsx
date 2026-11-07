"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import { SPEAKER_NAME_TEXT_CLASSES } from "./speakerStyles";
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

interface ConversationCardProps {
  conversation: ConversationItem;
  canManage: boolean;
  isLoadingEdit: boolean;
  isDeleting: boolean;
  onEdit: (conversation: ConversationItem) => void;
  onDelete: (conversation: ConversationItem) => void;
}

/**
 * The saved sequence as an entry number, the same quiet `#N` line vocabulary
 * and sentence use. It rides the first line of the Conversation cell rather
 * than a column of its own because it is the admin's ordering, not a fact
 * about the dialogue.
 */
function SequenceLabel({
  sequence,
  className = "",
}: {
  sequence: number;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] font-semibold tracking-wider text-slate-400 tabular-nums ${className}`}
    >
      {`#${sequence}`}
    </span>
  );
}

/**
 * The two speaker names on one line. They are colour-matched to the badges the
 * turn list uses rather than repeated as chips here, because this is a label
 * about who talks, not another state to notice.
 */
function SpeakerNames({
  conversation,
  className = "",
}: {
  conversation: ConversationItem;
  className?: string;
}) {
  return (
    <p className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        className={`font-semibold ${SPEAKER_NAME_TEXT_CLASSES.one}`}
      >{conversation.speaker1}</span>
      <span aria-hidden="true" className="text-slate-300">
        ·
      </span>
      <span className={`font-semibold ${SPEAKER_NAME_TEXT_CLASSES.two}`}>
        {conversation.speaker2}
      </span>
    </p>
  );
}

/** One row of the conversation list, redrawn as a card for the phone width. */
function ConversationCard({
  conversation,
  canManage,
  isLoadingEdit,
  isDeleting,
  onEdit,
  onDelete,
}: ConversationCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={conversation.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{conversation.categoryName}</span>
        </p>
        {canManage && !conversation.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-900">
        {conversation.title}
      </p>

      <SpeakerNames
        conversation={conversation}
        className="mt-1.5 text-sm leading-6"
      />

      <p className="mt-1.5 line-clamp-2 break-words text-sm leading-6 text-slate-600">
        {conversation.description}
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/conversations/${conversation.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update conversation"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isLoadingEdit}
              onClick={() => onEdit(conversation)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete conversation"
              color="rose"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isDeleting}
              onClick={() => onDelete(conversation)}
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </TableActionButton>
          </div>
        )}
      </div>
    </div>
  );
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

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides. The Conversation cell is
  // one entry — its sequence number, the title, the two speakers, then what the
  // dialogue is about — because the speakers name the turns rather than group
  // them, and a column of two chips repeated the fact the card has to carry
  // anyway.
  const columns: Column<ConversationItem>[] = [
    {
      key: "conversation",
      header: "Conversation",
      className: "whitespace-normal",
      render: (conversation) => (
        <div className="min-w-[140px] max-w-md whitespace-normal break-words">
          <SequenceLabel sequence={conversation.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{conversation.title}</p>
            {canManage && !conversation.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
          <SpeakerNames conversation={conversation} className="mt-1 text-xs" />
          <p className="mt-1 text-xs text-slate-500">
            {truncateDescription(conversation.description)}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (conversation) => (
        <Badge variant="neutral" size="sm">
          {conversation.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (conversation) => (
        <Link
          href={`/conversations/${conversation.id}`}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
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
      renderCard={(conversation) => (
        <ConversationCard
          conversation={conversation}
          canManage={canManage}
          isLoadingEdit={loadingEditId === conversation.id}
          isDeleting={deletingId === conversation.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
