"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/components/features/auth/AuthProvider";
import type { PresentationItem } from "@/types/presentation";

const TEXT_PREVIEW_LENGTH = 30;

function truncateText(text: string) {
  return text.length > TEXT_PREVIEW_LENGTH
    ? `${text.slice(0, TEXT_PREVIEW_LENGTH)}...`
    : text;
}

interface PresentationTableProps {
  presentations: PresentationItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (presentation: PresentationItem) => void;
  onDelete: (presentation: PresentationItem) => void;
}

interface PresentationCardProps {
  presentation: PresentationItem;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: (presentation: PresentationItem) => void;
  onDelete: (presentation: PresentationItem) => void;
}

/**
 * The saved sequence as an entry number, the same quiet `#N` line vocabulary,
 * sentence and conversation use. It rides the first line of the Presentation
 * cell rather than a column of its own because it is the admin's ordering, not
 * a fact about the passage.
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

/** One row of the presentation list, redrawn as a card for the phone width. */
function PresentationCard({
  presentation,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: PresentationCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={presentation.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{presentation.categoryName}</span>
        </p>
        {canManage && !presentation.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-900">
        {presentation.title}
      </p>

      {/* The card has the width for two lines of the passage itself, so it does
          not repeat the table's thirty-character cut. */}
      <p className="mt-1.5 line-clamp-2 break-words whitespace-pre-line text-sm leading-6 text-slate-600">
        {presentation.text}
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/presentation/${presentation.slug}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice Now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update Presentation"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onEdit(presentation)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete Presentation"
              color="rose"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isDeleting}
              onClick={() => onDelete(presentation)}
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

export function PresentationTable({
  presentations,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: PresentationTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides. The Presentation cell is
  // one entry — its sequence number, the title, then the opening of the
  // passage — because a number nobody filters or sorts by would widen both
  // faces to give the list a fact nobody acts on.
  const columns: Column<PresentationItem>[] = [
    {
      key: "presentation",
      header: "Presentation",
      className: "whitespace-normal",
      render: (presentation) => (
        <div className="min-w-[140px] max-w-md whitespace-normal break-words">
          <SequenceLabel sequence={presentation.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{presentation.title}</p>
            {canManage && !presentation.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {truncateText(presentation.text)}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (presentation) => (
        <Badge variant="neutral" size="sm">
          {presentation.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (presentation) => (
        <Link
          href={`/presentation/${presentation.slug}`}
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
      render: (presentation) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit Presentation"
            color="blue"
            onClick={() => onEdit(presentation)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete Presentation"
            color="rose"
            isLoading={deletingId === presentation.id}
            onClick={() => onDelete(presentation)}
          >
            <FiTrash2 className="w-4 w-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={presentations}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No presentations found matching your search."
      renderCard={(presentation) => (
        <PresentationCard
          presentation={presentation}
          canManage={canManage}
          isDeleting={deletingId === presentation.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
