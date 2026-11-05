"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
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

  const columns: Column<Listening>[] = [
    {
      key: "listening",
      header: "Listening",
      className: "whitespace-normal",
      render: (listening) => (
        <div className="max-w-[240px] whitespace-normal break-words sm:max-w-md">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{listening.title}</p>
            {canManage && !listening.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
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
      key: "sentences",
      header: "Sentences",
      render: (listening) => (
        <Badge variant="info" size="sm">
          {sentenceCountLabel(listening.itemCount)}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (listening) => (
        <Link
          href={`/listenings/${listening.id}`}
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
      render: (listening) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit listening"
            color="blue"
            isLoading={loadingEditId === listening.id}
            onClick={() => onEdit(listening)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete listening"
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
    />
  );
}
