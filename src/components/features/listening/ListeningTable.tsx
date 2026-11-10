"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/components/features/auth/AuthProvider";
import type { Listening } from "@/types/listening";

function sentenceCountLabel(count: number) {
  return `${count} ${count === 1 ? "sentence" : "sentences"}`;
}

interface ListeningTableProps {
  listenings: Listening[];
  isLoading: boolean;
  deletingId: string | null;
  loadingEditId: string | null;
  onEdit: (listening: Listening) => void;
  onDelete: (listening: Listening) => void;
}

interface ListeningCardProps {
  listening: Listening;
  canManage: boolean;
  isDeleting: boolean;
  loadingEditId: string | null;
  onEdit: (listening: Listening) => void;
  onDelete: (listening: Listening) => void;
}

/**
 * The saved sequence as an entry number, the same quiet `#N` line vocabulary,
 * sentence, conversation, presentation and the question library use. It rides
 * the first line of the Listening cell rather than a column of its own because
 * it is the admin's ordering, not a fact about the listening.
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
 * The number of sentences a listening holds. It used to be a column of its own;
 * the count describes the row the learner is about to open, so it now sits in
 * the Listening cell in both faces and the table lost a column to the change.
 */
function SentenceCountBadge({ count }: { count: number }) {
  return (
    <Badge variant="info" size="sm">
      {sentenceCountLabel(count)}
    </Badge>
  );
}

/** One row of the listening list, redrawn as a card for the phone width. */
function ListeningCard({
  listening,
  canManage,
  isDeleting,
  loadingEditId,
  onEdit,
  onDelete,
}: ListeningCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={listening.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{listening.categoryName}</span>
        </p>
        {canManage && !listening.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-900">
        {listening.title}
      </p>

      {/* A listening is only ever a title and a length — the sentence text is
          deliberately kept out of the list — so the count is the whole body. */}
      <div className="mt-2">
        <SentenceCountBadge count={listening.itemCount} />
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/listening/${listening.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice Now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update Listening"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={loadingEditId === listening.id}
              onClick={() => onEdit(listening)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete Listening"
              color="rose"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isDeleting}
              onClick={() => onDelete(listening)}
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

export function ListeningTable({
  listenings,
  isLoading,
  deletingId,
  loadingEditId,
  onEdit,
  onDelete,
}: ListeningTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides. The Listening cell is
  // one entry — its sequence number, the title, then how many sentences are
  // inside — because that count is the only thing a learner can act on before
  // opening the row.
  const columns: Column<Listening>[] = [
    {
      key: "listening",
      header: "Listening",
      className: "whitespace-normal",
      render: (listening) => (
        <div className="min-w-[140px] max-w-md whitespace-normal break-words">
          <SequenceLabel sequence={listening.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{listening.title}</p>
            {canManage && !listening.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <SentenceCountBadge count={listening.itemCount} />
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (listening) => (
        <Badge variant="neutral" size="sm">
          {listening.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (listening) => (
        <Link
          href={`/listening/${listening.id}`}
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
      render: (listening) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit Listening"
            color="blue"
            isLoading={loadingEditId === listening.id}
            onClick={() => onEdit(listening)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete Listening"
            color="rose"
            isLoading={deletingId === listening.id}
            onClick={() => onDelete(listening)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={listenings}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No listenings found matching your search."
      renderCard={(listening) => (
        <ListeningCard
          listening={listening}
          canManage={canManage}
          isDeleting={deletingId === listening.id}
          loadingEditId={loadingEditId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
