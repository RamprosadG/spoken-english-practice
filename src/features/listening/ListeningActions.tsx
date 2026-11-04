"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { CategoryManageButton } from "@/features/category/CategoryManageButton";
import type { CategoryOption, CategoryRow } from "@/types/category";
import { ListeningFormModal } from "./ListeningFormModal";

interface ListeningActionsProps {
  nextSequence: number;
  categories: CategoryOption[];
  categoryRows: CategoryRow[];
}

export function ListeningActions({
  nextSequence,
  categories,
  categoryRows,
}: ListeningActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [, startRefresh] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <>
      <Button
        icon={<FiPlus className="h-4 w-4" />}
        onClick={() => setIsCreateOpen(true)}
        className="w-full whitespace-nowrap sm:w-auto max-sm:text-xs max-sm:px-2 max-sm:gap-1.5"
      >
        New listening
      </Button>

      <CategoryManageButton kind="listening" categories={categoryRows} />

      {isCreateOpen && (
        <ListeningFormModal
          listening={null}
          categories={categories}
          defaultSequence={nextSequence}
          onClose={() => setIsCreateOpen(false)}
          onSaved={(message) => {
            setIsCreateOpen(false);
            showSuccessAlert(message);
            // The library is a server read, so refetch instead of patching
            // local state.
            startRefresh(() => router.refresh());
          }}
        />
      )}
    </>
  );
}
