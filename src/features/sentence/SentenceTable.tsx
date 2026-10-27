"use client";

import { FiChevronUp, FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import type { SentenceItem } from "@/types/sentence";
import { SentencePracticePanel } from "./SentencePracticePanel";

interface SentenceTableProps {
  sentences: SentenceItem[];
  isLoading: boolean;
  deletingId: string | null;
  expandedId: string | null;
  onTogglePractice: (sentence: SentenceItem) => void;
  onEdit: (sentence: SentenceItem) => void;
  onDelete: (sentence: SentenceItem) => void;
}

export function SentenceTable({
  sentences,
  isLoading,
  deletingId,
  expandedId,
  onTogglePractice,
  onEdit,
  onDelete,
}: SentenceTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const columns: Column<SentenceItem>[] = [
    {
      key: "sentence",
      header: "Sentence",
      className: "whitespace-normal max-sm:px-2",
      render: (sentence) => (
        <div className="min-w-[140px] max-w-[260px] whitespace-normal break-words sm:max-w-md">
          <p className="line-clamp-2 font-medium leading-6 text-slate-900">
            {sentence.text}
          </p>
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
      key: "practice",
      header: "Practice",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (sentence) => {
        const isExpanded = expandedId === sentence.id;

        return (
          <button
            type="button"
            onClick={() => onTogglePractice(sentence)}
            aria-expanded={isExpanded}
            aria-controls={`sentence-practice-${sentence.id}`}
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
      render: (sentence) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit sentence"
            color="blue"
            onClick={() => onEdit(sentence)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete sentence"
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
      expandedRowId={expandedId}
      renderExpandedRow={(sentence) => (
        <SentencePracticePanel
          key={sentence.updatedAt}
          sentence={sentence}
        />
      )}
    />
  );
}
