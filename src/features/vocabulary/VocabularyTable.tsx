"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import { InlineIpa } from "@/features/practice/InlineIpa";
import type { VocabularyItem } from "@/types/vocabulary";

interface VocabularyTableProps {
  vocabularies: VocabularyItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (vocabulary: VocabularyItem) => void;
  onDelete: (vocabulary: VocabularyItem) => void;
}

interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: (vocabulary: VocabularyItem) => void;
  onDelete: (vocabulary: VocabularyItem) => void;
}

/**
 * Dictionary-style part-of-speech label. It sits beside the word as quiet text
 * rather than another chip, so the only badge left in a row is the one that
 * describes a state the reader has to notice — Draft.
 */
function PartOfSpeech({ text }: { text: string }) {
  return (
    <span className="ml-2 align-middle text-xs font-medium italic text-slate-500">
      {text}
    </span>
  );
}

/** One row of the vocabulary list, redrawn as a card for the phone width. */
function VocabularyCard({
  vocabulary,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: VocabularyCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {vocabulary.categoryName}
        </p>
        {canManage && !vocabulary.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-lg font-semibold leading-7 text-slate-900">
        {vocabulary.text}
        <PartOfSpeech text={vocabulary.partsOfSpeech} />
      </p>

      <InlineIpa text={vocabulary.text} accent="en-GB" />

      <p
        lang="bn"
        className="mt-1.5 break-words text-sm leading-6 text-slate-700"
      >
        {vocabulary.meaning}
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/vocabulary/${vocabulary.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update vocabulary"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onEdit(vocabulary)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete vocabulary"
              color="rose"
              isLoading={isDeleting}
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onDelete(vocabulary)}
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

export function VocabularyTable({
  vocabularies,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: VocabularyTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides. The Word cell is a
  // three-line dictionary entry — word with its part of speech beside it, the
  // IPA under the word, the meaning under that — because a word needs no
  // column of its own for either.
  const columns: Column<VocabularyItem>[] = [
    {
      key: "word",
      header: "Word",
      className: "whitespace-normal",
      render: (vocabulary) => (
        <div className="max-w-sm min-w-[200px] whitespace-normal">
          <p className="break-words text-base font-semibold leading-6 text-slate-900">
            {vocabulary.text}
            <PartOfSpeech text={vocabulary.partsOfSpeech} />
            {canManage && !vocabulary.isPublished && (
              <Badge variant="warning" size="sm" className="ml-2 align-middle">
                Draft
              </Badge>
            )}
          </p>
          <InlineIpa text={vocabulary.text} accent="en-GB" />
          <p
            lang="bn"
            className="mt-1 break-words text-sm leading-6 text-slate-600"
          >
            {vocabulary.meaning}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (vocabulary) => (
        <Badge variant="neutral" size="sm">
          {vocabulary.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (vocabulary) => (
        <Link
          href={`/vocabulary/${vocabulary.id}`}
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
      render: (vocabulary) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit vocabulary"
            color="blue"
            onClick={() => onEdit(vocabulary)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete vocabulary"
            color="rose"
            isLoading={deletingId === vocabulary.id}
            onClick={() => onDelete(vocabulary)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={vocabularies}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No vocabulary found matching your filters."
      renderCard={(vocabulary) => (
        <VocabularyCard
          vocabulary={vocabulary}
          canManage={canManage}
          isDeleting={deletingId === vocabulary.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
