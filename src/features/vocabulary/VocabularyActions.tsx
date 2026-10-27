"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { showSuccessAlert } from "@/components/ui/alerts/Alerts";
import Button from "@/components/ui/buttons/Button";
import { useAuth } from "@/features/auth/AuthProvider";
import { VocabularyFormModal } from "./VocabularyFormModal";

interface VocabularyActionsProps {
  nextSequence: number;
}

export function VocabularyActions({ nextSequence }: VocabularyActionsProps) {
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
        New word
      </Button>

      {isCreateOpen && (
        <VocabularyFormModal
          vocabulary={null}
          defaultSequence={nextSequence}
          onClose={() => setIsCreateOpen(false)}
          onSaved={(message) => {
            setIsCreateOpen(false);
            showSuccessAlert(message);
            startRefresh(() => router.refresh());
          }}
        />
      )}
    </>
  );
}
