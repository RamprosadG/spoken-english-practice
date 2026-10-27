"use client";

import { FiChevronUp, FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import { InlineIpa } from "@/features/practice/InlineIpa";
import type { VocabularyItem } from "@/types/vocabulary";
import { VocabularyPracticePanel } from "./VocabularyPracticePanel";

interface VocabularyTableProps {
  vocabularies: VocabularyItem[];
  isLoading: boolean;
  deletingId: string | null;
  expandedId: string | null;
  onTogglePractice: (vocabulary: VocabularyItem) => void;
  onEdit: (vocabulary: VocabularyItem) => void;
  onDelete: (vocabulary: VocabularyItem) => void;
}

export function VocabularyTable({
  vocabularies,
  isLoading,
  deletingId,
  expandedId,
  onTogglePractice,
  onEdit,
  onDelete,
}: VocabularyTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const columns: Column<VocabularyItem>[] = [
    {
      key: "sequence",
      header: "Sequence",
      headerClassName: "max-sm:hidden",
      className: "max-sm:hidden",
      render: (vocabulary) => (
        <span className="font-semibold text-slate-800">
          {vocabulary.sequence}
        </span>
      ),
    },
    {
      key: "word",
      header: "Word",
      className: "whitespace-normal max-sm:px-2",
      render: (vocabulary) => (
        <div className="min-w-[140px] max-w-[260px] whitespace-normal break-words sm:max-w-md">
          <span className="mb-1 inline-flex h-5 min-w-5 items-center justify-center rounded bg-slate-200 px-1.5 text-[11px] font-semibold text-slate-700 sm:hidden">
            {vocabulary.sequence}
          </span>
          <p className="line-clamp-2 font-semibold leading-6 text-slate-900">
            {vocabulary.text}
          </p>
          <p
            lang="bn"
            className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600"
          >
            {vocabulary.meaning}
          </p>
          <InlineIpa
            text={vocabulary.text}
            accent="en-GB"
            className="sm:hidden"
          />
        </div>
      ),
    },
    {
      key: "ipa",
      header: "IPA",
      headerClassName: "max-sm:hidden",
      className: "whitespace-normal max-sm:hidden",
      render: (vocabulary) => (
        <div className="max-w-[190px]">
          <InlineIpa text={vocabulary.text} accent="en-GB" />
        </div>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (vocabulary) => {
        const isExpanded = expandedId === vocabulary.id;

        return (
          <button
            type="button"
            onClick={() => onTogglePractice(vocabulary)}
            aria-expanded={isExpanded}
            aria-controls={`vocabulary-practice-${vocabulary.id}`}
            className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isExpanded
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
            }`}
          >
            {isExpanded ? (
              <FiChevronUp className="h-4 w-4" />
            ) : (
              <FiPlayCircle className="h-4 w-4" />
            )}
            {isExpanded ? "Hide" : "Practice"}
          </button>
        );
      },
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "Actions",
      headerClassName: "text-right max-sm:px-2",
      className: "text-right max-sm:px-2",
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
      expandedRowId={expandedId}
      renderExpandedRow={(vocabulary) => (
        <VocabularyPracticePanel
          key={vocabulary.updatedAt}
          vocabulary={vocabulary}
        />
      )}
    />
  );
}
