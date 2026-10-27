"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { IoIosStar } from "react-icons/io";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import Modal from "@/components/ui/modals/Modal";
import type { SentenceItem } from "@/types/sentence";
import { sentenceRequest } from "./sentence-client";

interface SentenceFormModalProps {
  sentence: SentenceItem | null;
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  text?: string;
  meaning?: string;
  sequence?: string;
}

export function SentenceFormModal({
  sentence,
  defaultSequence,
  onClose,
  onSaved,
}: SentenceFormModalProps) {
  const isEditing = Boolean(sentence);
  const [text, setText] = useState(sentence?.text ?? "");
  const [meaning, setMeaning] = useState(sentence?.meaning ?? "");
  const [sequence, setSequence] = useState(
    String(sentence?.sequence ?? defaultSequence),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!text.trim()) {
      nextErrors.text = "Sentence text is required.";
    }

    if (!meaning.trim()) {
      nextErrors.meaning = "Meaning is required.";
    }

    const parsedSequence = Number(sequence);
    if (!Number.isInteger(parsedSequence) || parsedSequence < 1) {
      nextErrors.sequence = "Sequence must be a whole number of at least 1.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const path = isEditing
        ? `/api/sentences/${sentence?.id}`
        : "/api/sentences";

      await sentenceRequest<SentenceItem>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          text: text.trim(),
          meaning: meaning.trim(),
          sequence: Number(sequence),
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
      title={isEditing ? "Edit sentence" : "New sentence"}
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
              className="text-sm font-medium text-slate-800"
            >
              English sentence
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
              className="text-sm font-medium text-slate-800"
            >
              Bengali meaning
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

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary-outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isEditing ? "Save changes" : "Create sentence"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
