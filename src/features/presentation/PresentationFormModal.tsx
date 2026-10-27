"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { IoIosStar } from "react-icons/io";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import Modal from "@/components/ui/modals/Modal";
import type { PresentationItem } from "@/types/presentation";
import { presentationRequest } from "./presentation-client";

interface PresentationFormModalProps {
  presentation: PresentationItem | null;
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  title?: string;
  text?: string;
  sequence?: string;
}

export function PresentationFormModal({
  presentation,
  defaultSequence,
  onClose,
  onSaved,
}: PresentationFormModalProps) {
  const isEditing = Boolean(presentation);
  const [title, setTitle] = useState(presentation?.title ?? "");
  const [text, setText] = useState(presentation?.text ?? "");
  const [sequence, setSequence] = useState(
    String(presentation?.sequence ?? defaultSequence),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!text.trim()) {
      nextErrors.text = "Text is required.";
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
        ? `/api/presentations/${presentation?.id}`
        : "/api/presentations";

      await presentationRequest<PresentationItem>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
          sequence: Number(sequence),
        }),
      });

      onSaved(
        isEditing
          ? "Presentation updated successfully."
          : "Presentation created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the presentation. Please try again.",
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
      title={isEditing ? "Edit presentation" : "New presentation"}
      className="max-w-2xl"
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          type="text"
          name="title"
          id="presentation-title"
          required
          maxLength={200}
          error={errors.title}
          placeholder="Enter a title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (errors.title) {
              setErrors((current) => ({ ...current, title: undefined }));
            }
            if (apiError) setApiError("");
          }}
        />

        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-1">
            <label
              htmlFor="presentation-text"
              className="text-sm font-medium text-slate-800"
            >
              Text
            </label>
            <IoIosStar className="h-2 w-2 text-red-500" />
          </div>
          <textarea
            id="presentation-text"
            name="text"
            required
            rows={10}
            maxLength={20000}
            placeholder="Paste or write the English text for this presentation"
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

        <Input
          label="Sequence"
          type="number"
          name="sequence"
          id="presentation-sequence"
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
            {isEditing ? "Save changes" : "Create presentation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
