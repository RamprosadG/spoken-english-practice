"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Swal from "sweetalert2";
import { FiCheck, FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import Modal from "@/components/ui/modals/Modal";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import {
  CATEGORY_NOUNS,
  capitalize,
  categoryUsageLabel,
  type CategoryKind,
} from "@/lib/categories";
import type { CategoryRow } from "@/types/category";
import { categoryPath, categoryRequest } from "./category-client";

interface CategoryManageModalProps {
  kind: CategoryKind;
  title: string;
  categories: CategoryRow[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface EditState {
  id: string;
  name: string;
  sequence: string;
}

export function CategoryManageModal({
  kind,
  title,
  categories,
  onClose,
  onSaved,
}: CategoryManageModalProps) {
  // One modal manages all the pickers, so every label comes from the registry:
  // categories for four libraries, topics for the interview one.
  const noun = CATEGORY_NOUNS[kind];
  const nounLabel = capitalize(noun.singular);
  const [name, setName] = useState("");
  const [sequence, setSequence] = useState("");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isBusy = isSubmitting || deletingId !== null;

  function parseSequence(value: string): number | undefined {
    const parsed = Number(value);
    return value.trim() && Number.isInteger(parsed) && parsed >= 1
      ? parsed
      : undefined;
  }

  function buildPayload(values: { name: string; sequence: string }) {
    const payload: { name: string; sequence?: number } = {
      name: values.name.trim(),
    };
    const parsed = parseSequence(values.sequence);
    if (parsed !== undefined) {
      payload.sequence = parsed;
    }

    return payload;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    setIsSubmitting(true);
    try {
      await categoryRequest<null>(categoryPath(kind), {
        method: "POST",
        body: JSON.stringify(buildPayload({ name, sequence })),
      });
      setName("");
      setSequence("");
      onSaved(`${nounLabel} created successfully.`);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : `Failed to save the ${noun.singular}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setApiError("");

    setIsSubmitting(true);
    try {
      await categoryRequest<null>(categoryPath(kind, editing.id), {
        method: "PATCH",
        body: JSON.stringify(buildPayload(editing)),
      });
      setEditing(null);
      onSaved(`${nounLabel} updated successfully.`);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : `Failed to save the ${noun.singular}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(category: CategoryRow) {
    const result = await Swal.fire({
      title: `Delete ${noun.singular}?`,
      text: `"${category.name}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(category.id);
    setApiError("");
    try {
      await categoryRequest<null>(categoryPath(kind, category.id), {
        method: "DELETE",
      });
      if (editing?.id === category.id) {
        setEditing(null);
      }
      onSaved(`${nounLabel} deleted successfully.`);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : `Failed to delete the ${noun.singular}. Please try again.`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Modal isOpen onClose={isBusy ? undefined : onClose} title={title}>
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <Input
            label={`New ${noun.singular}`}
            type="text"
            name="category-name"
            id={`category-${kind}-name`}
            required
            hideOptionalText
            maxLength={100}
            placeholder={`Enter a ${noun.singular} name`}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (apiError) setApiError("");
            }}
          />
          <Input
            label="Sequence"
            type="number"
            name="category-sequence"
            id={`category-${kind}-sequence`}
            min={1}
            max={100000}
            placeholder="Auto"
            value={sequence}
            onChange={(event) => {
              setSequence(event.target.value);
              if (apiError) setApiError("");
            }}
          />
        </div>
        <Button
          type="submit"
          icon={<FiPlus className="h-4 w-4" />}
          isLoading={isSubmitting}
          disabled={isBusy}
        >
          Add {noun.singular}
        </Button>
      </form>

      <ul className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5">
        {categories.length === 0 && (
          <li className="text-sm text-slate-500">
            No {noun.plural} yet. Add one to start grouping.
          </li>
        )}

        {categories.map((category) => {
          const draft = editing && editing.id === category.id ? editing : null;

          if (draft) {
            return (
              <li key={category.id}>
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-col gap-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                    <Input
                      label="Name"
                      type="text"
                      name={`category-name-${category.id}`}
                      required
                      hideOptionalText
                      maxLength={100}
                      value={draft.name}
                      onChange={(event) =>
                        setEditing({ ...draft, name: event.target.value })
                      }
                    />
                    <Input
                      label="Sequence"
                      type="number"
                      name={`category-sequence-${category.id}`}
                      min={1}
                      max={100000}
                      value={draft.sequence}
                      onChange={(event) =>
                        setEditing({
                          ...draft,
                          sequence: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditing(null)}
                      disabled={isBusy}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      icon={<FiCheck className="h-4 w-4" />}
                      isLoading={isSubmitting}
                      disabled={isBusy}
                      className="w-full"
                    >
                      Save changes
                    </Button>
                  </div>
                </form>
              </li>
            );
          }

          return (
            <li
              key={category.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {category.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Sequence {category.sequence} ·{" "}
                  {categoryUsageLabel(kind, category.usageCount)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <TableActionButton
                  tooltip={`Edit ${category.name}`}
                  color="blue"
                  disabled={isBusy}
                  onClick={() => {
                    setApiError("");
                    setEditing({
                      id: category.id,
                      name: category.name,
                      sequence: String(category.sequence),
                    });
                  }}
                >
                  <FiEdit className="h-4 w-4" />
                </TableActionButton>
                <TableActionButton
                  tooltip={
                    category.usageCount > 0
                      ? `${category.name} is still in use`
                      : `Delete ${category.name}`
                  }
                  color="rose"
                  isLoading={deletingId === category.id}
                  disabled={isBusy || category.usageCount > 0}
                  onClick={() => handleDelete(category)}
                >
                  <FiTrash2 className="h-4 w-4" />
                </TableActionButton>
              </div>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
