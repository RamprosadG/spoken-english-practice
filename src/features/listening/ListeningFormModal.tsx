"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/components/ui/buttons/Button";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import Input from "@/components/ui/inputs/Input";
import Modal from "@/components/ui/modals/Modal";
import { buildCategoryFormOptions } from "@/lib/categories";
import {
  PUBLICATION_FORM_OPTIONS,
  isPublishedFromStatus,
  publicationStatusValue,
} from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";
import type { ListeningDetail } from "@/types/listening";
import {
  ListeningItemSorter,
  createItemKey,
  type ListeningItemDraft,
} from "./ListeningItemSorter";
import { listeningRequest } from "./listening-client";

interface ListeningFormModalProps {
  listening: ListeningDetail | null;
  categories: CategoryOption[];
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  title?: string;
  category?: string;
  sequence?: string;
}

function buildInitialItems(listening: ListeningDetail | null): ListeningItemDraft[] {
  if (listening) {
    return listening.items.map((item) => ({
      key: createItemKey(),
      text: item.text,
    }));
  }

  return [{ key: createItemKey(), text: "" }];
}

export function ListeningFormModal({
  listening,
  categories,
  defaultSequence,
  onClose,
  onSaved,
}: ListeningFormModalProps) {
  const isEditing = Boolean(listening);
  const [title, setTitle] = useState(listening?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    listening?.categoryId ?? categories[0]?.id ?? "",
  );
  const [sequence, setSequence] = useState(
    String(listening?.sequence ?? defaultSequence),
  );
  const [status, setStatus] = useState(
    publicationStatusValue(listening?.isPublished ?? true),
  );
  const [items, setItems] = useState<ListeningItemDraft[]>(() =>
    buildInitialItems(listening),
  );
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateItems(next: ListeningItemDraft[]) {
    setItems(next);
    // Any edit can fix an empty sentence, so the per-row messages are dropped.
    setItemErrors({});
    if (apiError) setApiError("");
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    const nextItemErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!categoryId) nextErrors.category = "Choose a category.";

    items.forEach((item, index) => {
      if (!item.text.trim()) {
        nextItemErrors[item.key] = `Sentence ${index + 1} is empty.`;
      }
    });

    const parsedSequence = Number(sequence);
    if (!Number.isInteger(parsedSequence) || parsedSequence < 1) {
      nextErrors.sequence = "Sequence must be a whole number of at least 1.";
    }

    setErrors(nextErrors);
    setItemErrors(nextItemErrors);

    return (
      Object.keys(nextErrors).length === 0 &&
      Object.keys(nextItemErrors).length === 0
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const path = isEditing
        ? `/api/listenings/${listening?.id}`
        : "/api/listenings";

      await listeningRequest<ListeningDetail>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          title: title.trim(),
          categoryId,
          sequence: Number(sequence),
          isPublished: isPublishedFromStatus(status),
          items: items.map((item) => item.text.trim()),
        }),
      });

      onSaved(
        isEditing
          ? "Listening updated successfully."
          : "Listening created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the listening. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={isEditing ? "Edit Listening" : "New Listening"}
      className="max-w-2xl"
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Title"
          type="text"
          name="title"
          id="listening-title"
          required
          maxLength={200}
          error={errors.title}
          placeholder="What this listening is about"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (errors.title) {
              setErrors((current) => ({ ...current, title: undefined }));
            }
            if (apiError) setApiError("");
          }}
        />

        <ListeningItemSorter
          items={items}
          errors={itemErrors}
          onChange={updateItems}
        />

        <Dropdown
          label="Category"
          id="listening-category"
          name="categoryId"
          options={buildCategoryFormOptions(categories)}
          value={categoryId}
          error={errors.category}
          onChange={(value) => {
            setCategoryId(value);
            if (errors.category) {
              setErrors((current) => ({ ...current, category: undefined }));
            }
            if (apiError) setApiError("");
          }}
          required
        />

        <Dropdown
          label="Status"
          id="listening-status"
          name="isPublished"
          options={PUBLICATION_FORM_OPTIONS}
          value={status}
          onChange={setStatus}
          required
        />

        <Input
          label="Sequence"
          type="number"
          name="sequence"
          id="listening-sequence"
          required
          min={1}
          max={100000}
          error={errors.sequence}
          value={sequence}
          onChange={(event) => {
            setSequence(event.target.value);
            if (errors.sequence) {
              setErrors((current) => ({ ...current, sequence: undefined }));
            }
            if (apiError) setApiError("");
          }}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            {isEditing ? "Save Changes" : "Create Listening"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
