"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/components/features/auth/AuthProvider";
import type { StoryItem } from "@/types/story";

const TEXT_PREVIEW_LENGTH = 30;

function truncateText(text: string) {
  return text.length > TEXT_PREVIEW_LENGTH
    ? `${text.slice(0, TEXT_PREVIEW_LENGTH)}...`
    : text;
}

interface StoryTableProps {
  stories: StoryItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (story: StoryItem) => void;
  onDelete: (story: StoryItem) => void;
}

interface StoryCardProps {
  story: StoryItem;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: (story: StoryItem) => void;
  onDelete: (story: StoryItem) => void;
}

/**
 * The saved sequence as an entry number, the same quiet `#N` line vocabulary,
 * sentence and conversation use. It rides the first line of the Story cell
 * rather than a column of its own because it is the admin's ordering, not a
 * fact about the story.
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

/** One row of the story list, redrawn as a card for the phone width. */
function StoryCard({
  story,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: StoryCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={story.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{story.categoryName}</span>
        </p>
        {canManage && !story.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-900">
        {story.title}
      </p>

      {/* The card has the width for two lines of the story itself, so it does
          not repeat the table's thirty-character cut. */}
      <p className="mt-1.5 line-clamp-2 break-words whitespace-pre-line text-sm leading-6 text-slate-600">
        {story.text}
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/story/${story.slug}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice Now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update Story"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onEdit(story)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete Story"
              color="rose"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isDeleting}
              onClick={() => onDelete(story)}
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

export function StoryTable({
  stories,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: StoryTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides. The Story cell is one
  // entry — its sequence number, the title, then the opening of the story —
  // because a number nobody filters or sorts by would widen both faces to give
  // the list a fact nobody acts on.
  const columns: Column<StoryItem>[] = [
    {
      key: "story",
      header: "Story",
      className: "whitespace-normal",
      render: (story) => (
        <div className="min-w-[140px] max-w-md whitespace-normal break-words">
          <SequenceLabel sequence={story.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{story.title}</p>
            {canManage && !story.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {truncateText(story.text)}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (story) => (
        <Badge variant="neutral" size="sm">
          {story.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (story) => (
        <Link
          href={`/story/${story.slug}`}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice Now
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
      render: (story) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit Story"
            color="blue"
            onClick={() => onEdit(story)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete Story"
            color="rose"
            isLoading={deletingId === story.id}
            onClick={() => onDelete(story)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={stories}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No stories found matching your search."
      renderCard={(story) => (
        <StoryCard
          story={story}
          canManage={canManage}
          isDeleting={deletingId === story.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}