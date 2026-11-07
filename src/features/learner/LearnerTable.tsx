"use client";

import { FiEdit, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import type { LearnerItem } from "@/types/learner";
import {
  LEARNER_ROLE_BADGE_VARIANTS,
  LEARNER_ROLE_LABELS,
} from "@/types/learner";

function RoleBadge({ role }: { role: LearnerItem["role"] }) {
  return (
    <Badge variant={LEARNER_ROLE_BADGE_VARIANTS[role]} size="sm">
      {LEARNER_ROLE_LABELS[role]}
    </Badge>
  );
}

interface LearnerTableProps {
  learners: LearnerItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (learner: LearnerItem) => void;
  onDelete: (learner: LearnerItem) => void;
}

/** One row of the account list, redrawn as a card for the phone width. */
function LearnerCard({
  learner,
  isDeleting,
  onEdit,
  onDelete,
}: {
  learner: LearnerItem;
  isDeleting: boolean;
  onEdit: (learner: LearnerItem) => void;
  onDelete: (learner: LearnerItem) => void;
}) {
  return (
    <div>
      <p className="break-words text-base font-semibold leading-6 text-slate-900">
        {learner.name}
      </p>

      <p className="mt-1.5 break-words text-sm leading-6 text-slate-600">
        {learner.email}
      </p>

      {/* The role gets its own line here because it has its own column in the
          table, so both faces read name → email → role → actions. */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <RoleBadge role={learner.role} />
      </div>

      {/* There is no practice link on this page, so the bordered row sits
          straight under the data and keeps the chrome apart from it. */}
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <TableActionButton
          tooltip="Update learner"
          color="blue"
          className="h-11 flex-1 gap-1.5 text-xs font-semibold"
          onClick={() => onEdit(learner)}
        >
          <FiEdit className="h-4 w-4" />
          Update
        </TableActionButton>
        <TableActionButton
          tooltip="Delete learner"
          color="rose"
          className="h-11 flex-1 gap-1.5 text-xs font-semibold"
          isLoading={isDeleting}
          onClick={() => onDelete(learner)}
        >
          <FiTrash2 className="h-4 w-4" />
          Delete
        </TableActionButton>
      </div>
    </div>
  );
}

export function LearnerTable({
  learners,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: LearnerTableProps) {
  // This page is admin-only, so every reader of the table can manage it and
  // neither face needs a role branch. renderCard moves the phone width to the
  // card list, so the table itself only ever renders from sm up.
  const columns: Column<LearnerItem>[] = [
    {
      key: "name",
      header: "Name",
      className: "whitespace-normal",
      render: (learner) => (
        <p className="min-w-[140px] max-w-xs break-words font-semibold text-slate-900">
          {learner.name}
        </p>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "whitespace-normal",
      render: (learner) => (
        <p className="max-w-sm break-words text-slate-600">{learner.email}</p>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (learner) => <RoleBadge role={learner.role} />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (learner) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit learner"
            color="blue"
            onClick={() => onEdit(learner)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete learner"
            color="rose"
            isLoading={deletingId === learner.id}
            onClick={() => onDelete(learner)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={learners}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No learners found matching your search."
      renderCard={(learner) => (
        <LearnerCard
          learner={learner}
          isDeleting={deletingId === learner.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
