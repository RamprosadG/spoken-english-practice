"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
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

export function PresentationTable({
  presentations,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: PresentationTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const columns: Column<PresentationItem>[] = [
    {
      key: "title",
      header: "Title",
      className: "whitespace-normal",
      render: (presentation) => (
        <div className="max-w-[240px] whitespace-normal break-words sm:max-w-md">
          <p className="font-semibold text-slate-900">{presentation.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {truncateText(presentation.text)}
          </p>
        </div>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (presentation) => (
        <Link
          href={`/presentation/${presentation.id}`}
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
      render: (presentation) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit presentation"
            color="blue"
            onClick={() => onEdit(presentation)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete presentation"
            color="rose"
            isLoading={deletingId === presentation.id}
            onClick={() => onDelete(presentation)}
          >
            <FiTrash2 className="w-4 h-4" />
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
    />
  );
}
