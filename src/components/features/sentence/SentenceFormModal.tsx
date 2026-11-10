"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { IoIosStar } from "react-icons/io";
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
import type { SentenceItem } from "@/types/sentence";
import {
  SentenceAlternateList,
  createAlternateKey,
  type SentenceAlternateDraft,
} from "./SentenceAlternateList";
import { sentenceRequest } from "./sentence-client";

interface SentenceFormModalProps {
  sentence: SentenceItem | null;
  categories: CategoryOption[];
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  text?: string;
  meaning?: string;
  category?: string;
  sequence?: string;
}

function buildInitialAlternates(
  sentence: SentenceItem | null,
): SentenceAlternateDraft[] {
  return (sentence?.alternates ?? []).map((alternate) => ({
    key: createAlternateKey(),
    text: alternate.text,
  }));
}

export function SentenceFormModal({
  sentence,
  categories,
  defaultSequence,
  onClose,
  onSaved,
}: SentenceFormModalProps) {
  const isEditing = Boolean(sentence);
  const [text, setText] = useState(sentence?.text ?? "");
  const [meaning, setMeaning] = useState(sentence?.meaning ?? "");
  const [whenToUse, setWhenToUse] = useState(sentence?.whenToUse ?? "");
  const [categoryId, setCategoryId] = useState(
    sentence?.categoryId ?? categories[0]?.id ?? "",
  );
  const [sequence, setSequence] = useState(
    String(sentence?.sequence ?? defaultSequence),
  );
  const [status, setStatus] = useState(
    publicationStatusValue(sentence?.isPublished ?? true),
  );
  const [alternates, setAlternates] = useState<SentenceAlternateDraft[]>(() =>
    buildInitialAlternates(sentence),
  );
  const [alternateErrors, setAlternateErrors] = useState<Record<string, string>>(
    {},
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateAlternates(next: SentenceAlternateDraft[]) {
    setAlternates(next);
    // Any edit can fill an empty expression, so the per-row messages are dropped.
    setAlternateErrors({});
    if (apiError) setApiError("");
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    const nextAlternateErrors: Record<string, string> = {};

    if (!text.trim()) {
      nextErrors.text = "Sentence text is required.";
    }

    if (!meaning.trim()) {
      nextErrors.meaning = "Meaning is required.";
    }

    if (!categoryId) {
      nextErrors.category = "Choose a category.";
    }

    alternates.forEach((alternate, index) => {
      if (!alternate.text.trim()) {
        nextAlternateErrors[alternate.key] = `Expression ${index + 1} is empty.`;
      }
    });

    const parsedSequence = Number(sequence);
    if (!Number.isInteger(parsedSequence) || parsedSequence < 1) {
      nextErrors.sequence = "Sequence must be a whole number of at least 1.";
    }

    setErrors(nextErrors);
    setAlternateErrors(nextAlternateErrors);

    return (
      Object.keys(nextErrors).length === 0 &&
      Object.keys(nextAlternateErrors).length === 0
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const path = isEditing
        ? `/api/sentence/${sentence?.id}`
        : "/api/sentence";

      await sentenceRequest<SentenceItem>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          text: text.trim(),
          meaning: meaning.trim(),
          whenToUse: whenToUse.trim() || null,
          categoryId,
          sequence: Number(sequence),
          isPublished: isPublishedFromStatus(status),
          alternates: alternates.map((alternate) => alternate.text.trim()),
        }),
      });

      onSaved(
        isEditing
          ? "Sentence updated successfully."
          : "Sentence created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the sentence. Please try again.",
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
      title={isEditing ? "Edit Sentence" : "New Sentence"}
      className="max-w-2xl"
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-1">
            <label
              htmlFor="sentence-text"
              className="text-sm font-medium text-slate-800 max-sm:text-xs"
            >
              English Sentence
            </label>
            <IoIosStar className="h-2 w-2 text-red-500" />
          </div>
          <textarea
            id="sentence-text"
            name="text"
            required
            rows={4}
            maxLength={1000}
            placeholder="Write the English sentence to practise"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (errors.text) {
                setErrors((current) => ({ ...current, text: undefined }));
              }
              if (apiError) setApiError("");
            }}
            className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
              errors.text
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.text && (
            <span className="mt-0.5 text-xs font-medium text-red-600">
              {errors.text}
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-1">
            <label
              htmlFor="sentence-meaning"
              className="text-sm font-medium text-slate-800 max-sm:text-xs"
            >
              Bengali Meaning
            </label>
            <IoIosStar className="h-2 w-2 text-red-500" />
          </div>
          <textarea
            id="sentence-meaning"
            name="meaning"
            required
            rows={4}
            maxLength={1000}
            lang="bn"
            placeholder="Write the Bengali meaning of the sentence"
            value={meaning}
            onChange={(event) => {
              setMeaning(event.target.value);
              if (errors.meaning) {
                setErrors((current) => ({ ...current, meaning: undefined }));
              }
              if (apiError) setApiError("");
            }}
            className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
              errors.meaning
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.meaning && (
            <span className="mt-0.5 text-xs font-medium text-red-600">
              {errors.meaning}
            </span>
          )}
        </div>

        <Input
          label="When To Use"
          type="text"
          name="whenToUse"
          id="sentence-when-to-use"
          maxLength={500}
          placeholder="When you meet a stranger"
          value={whenToUse}
          onChange={(event) => {
            setWhenToUse(event.target.value);
            if (apiError) setApiError("");
          }}
        />

        <SentenceAlternateList
          alternates={alternates}
          errors={alternateErrors}
          onChange={updateAlternates}
        />

        <Dropdown
          label="Category"
          id="sentence-category"
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
          className="max-sm:text-xs"
          required
        />

        <Dropdown
          label="Status"
          id="sentence-status"
          name="isPublished"
          options={PUBLICATION_FORM_OPTIONS}
          value={status}
          onChange={setStatus}
          className="max-sm:text-xs"
          required
        />

        <Input
          label="Sequence"
          type="number"
          name="sequence"
          id="sentence-sequence"
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
            className="w-full max-sm:px-2 max-sm:gap-1.5 max-sm:text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full max-sm:px-2 max-sm:gap-1.5 max-sm:text-xs"
          >
            {isEditing ? "Save Changes" : "Create New"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
