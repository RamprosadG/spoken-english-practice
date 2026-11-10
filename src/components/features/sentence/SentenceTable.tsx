"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { InlineIpa } from "@/components/features/practice/InlineIpa";
import type { SentenceItem } from "@/types/sentence";

interface SentenceTableProps {
  sentences: SentenceItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (sentence: SentenceItem) => void;
  onDelete: (sentence: SentenceItem) => void;
}

interface SentenceCardProps {
  sentence: SentenceItem;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: (sentence: SentenceItem) => void;
  onDelete: (sentence: SentenceItem) => void;
}

/**
 * The saved sequence as an entry number, the same quiet `#N` line vocabulary
 * uses. It rides the first line of the Sentence cell rather than a column of
 * its own because it is the admin's ordering, not a fact about the sentence.
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
 * One row of the sentence list, redrawn as a card for the phone width. It
 * carries exactly what the table cell carries — the entry number and grouping,
 * the English sentence, its IPA, the Bengali meaning, one practice link — in
 * that order, so neither face hides a field the other shows. The grouping reads
 * as an uppercase caption above the sentence rather than a chip fighting it,
 * which leaves the admin's Draft state as the only badge in the card.
 */
function SentenceCard({
  sentence,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: SentenceCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={sentence.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{sentence.categoryName}</span>
        </p>
        {canManage && !sentence.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-900">
        {sentence.text}
      </p>

      <InlineIpa text={sentence.text} accent="en-GB" />

      <p
        lang="bn"
        className="mt-1.5 break-words text-sm leading-6 text-slate-700"
      >
        {sentence.meaning}
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/sentence/${sentence.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice Now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update Sentence"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onEdit(sentence)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete Sentence"
              color="rose"
              isLoading={isDeleting}
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onDelete(sentence)}
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

export function SentenceTable({
  sentences,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: SentenceTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides. The Sentence cell is one
  // entry — its sequence number, the English sentence, its automatic IPA, then
  // the Bengali meaning — capped so a long sentence cannot run to the edge of a
  // wide screen.
  const columns: Column<SentenceItem>[] = [
    {
      key: "sentence",
      header: "Sentence",
      className: "whitespace-normal",
      render: (sentence) => (
        <div className="min-w-[140px] max-w-md whitespace-normal break-words">
          <SequenceLabel sequence={sentence.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="line-clamp-2 font-medium leading-6 text-slate-900">
              {sentence.text}
            </p>
            {canManage && !sentence.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
          <InlineIpa text={sentence.text} accent="en-GB" />
          <p
            lang="bn"
            className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600"
          >
            {sentence.meaning}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (sentence) => (
        <Badge variant="neutral" size="sm">
          {sentence.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (sentence) => (
        <Link
          href={`/sentence/${sentence.id}`}
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
      render: (sentence) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit Sentence"
            color="blue"
            onClick={() => onEdit(sentence)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete Sentence"
            color="rose"
            isLoading={deletingId === sentence.id}
            onClick={() => onDelete(sentence)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={sentences}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No sentences found matching your search."
      renderCard={(sentence) => (
        <SentenceCard
          sentence={sentence}
          canManage={canManage}
          isDeleting={deletingId === sentence.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
