"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import type { SentenceItem } from "@/types/sentence";

interface SentenceTableProps {
  sentences: SentenceItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (sentence: SentenceItem) => void;
  onDelete: (sentence: SentenceItem) => void;
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

  const columns: Column<SentenceItem>[] = [
    {
      key: "sentence",
      header: "Sentence",
      className: "whitespace-normal max-sm:px-2",
      render: (sentence) => (
        <div className="min-w-[140px] max-w-[260px] whitespace-normal break-words sm:max-w-md">
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
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (sentence) => (
        <Badge variant="neutral" size="sm">
          {sentence.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (sentence) => (
        <Link
          href={`/sentences/${sentence.id}`}
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
    />
  );
}
