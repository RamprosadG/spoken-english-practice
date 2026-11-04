"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiTag } from "react-icons/fi";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { CATEGORY_MANAGE_TITLES, type CategoryKind } from "@/lib/categories";
import type { CategoryRow } from "@/types/category";
import { CategoryManageModal } from "./CategoryManageModal";

interface CategoryManageButtonProps {
  kind: CategoryKind;
  categories: CategoryRow[];
}

export function CategoryManageButton({
  kind,
  categories,
}: CategoryManageButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [, startRefresh] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Only admins manage categories, and only admins are given the usage counts
  // that this list is built from.
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        icon={<FiTag className="h-4 w-4" />}
        onClick={() => setIsOpen(true)}
        className="w-full whitespace-nowrap sm:w-auto max-sm:text-xs max-sm:px-2 max-sm:gap-1.5"
      >
        Categories
      </Button>

      {isOpen && (
        <CategoryManageModal
          kind={kind}
          title={CATEGORY_MANAGE_TITLES[kind]}
          categories={categories}
          onClose={() => setIsOpen(false)}
          onSaved={(message) => {
            showSuccessAlert(message);
            // Both this list and the library are server reads, so refetch
            // instead of patching local state.
            startRefresh(() => router.refresh());
          }}
        />
      )}
    </>
  );
}
