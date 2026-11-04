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
import type { ConversationDetailItem } from "@/types/conversation";
import {
  ConversationLineSorter,
  createLineKey,
  type ConversationLineDraft,
} from "./ConversationLineSorter";
import { conversationRequest } from "./conversation-client";

interface ConversationFormModalProps {
  conversation: ConversationDetailItem | null;
  categories: CategoryOption[];
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  speaker1?: string;
  speaker2?: string;
  category?: string;
  sequence?: string;
}

function buildInitialLines(
  conversation: ConversationDetailItem | null,
): ConversationLineDraft[] {
  if (conversation) {
    return conversation.lines.map((line) => ({
      key: createLineKey(),
      text: line.text,
    }));
  }

  return [
    { key: createLineKey(), text: "" },
    { key: createLineKey(), text: "" },
  ];
}

export function ConversationFormModal({
  conversation,
  categories,
  defaultSequence,
  onClose,
  onSaved,
}: ConversationFormModalProps) {
  const isEditing = Boolean(conversation);
  const [title, setTitle] = useState(conversation?.title ?? "");
  const [description, setDescription] = useState(conversation?.description ?? "");
  const [speaker1, setSpeaker1] = useState(conversation?.speaker1 ?? "");
  const [speaker2, setSpeaker2] = useState(conversation?.speaker2 ?? "");
  const [categoryId, setCategoryId] = useState(
    conversation?.categoryId ?? categories[0]?.id ?? "",
  );
  const [sequence, setSequence] = useState(
    String(conversation?.sequence ?? defaultSequence),
  );
  const [status, setStatus] = useState(
    publicationStatusValue(conversation?.isPublished ?? true),
  );
  const [lines, setLines] = useState<ConversationLineDraft[]>(() =>
    buildInitialLines(conversation),
  );
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateLines(next: ConversationLineDraft[]) {
    setLines(next);
    // Any edit can fix an empty turn, so the per-turn messages are dropped.
    setLineErrors({});
    if (apiError) setApiError("");
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    const nextLineErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    if (!speaker1.trim()) nextErrors.speaker1 = "Speaker 1 name is required.";
    if (!speaker2.trim()) nextErrors.speaker2 = "Speaker 2 name is required.";
    if (!categoryId) nextErrors.category = "Choose a category.";

    lines.forEach((line, index) => {
      if (!line.text.trim()) {
        nextLineErrors[line.key] = `Turn ${index + 1} is empty.`;
      }
    });

    const parsedSequence = Number(sequence);
    if (!Number.isInteger(parsedSequence) || parsedSequence < 1) {
      nextErrors.sequence = "Sequence must be a whole number of at least 1.";
    }

    setErrors(nextErrors);
    setLineErrors(nextLineErrors);

    return Object.keys(nextErrors).length === 0 && Object.keys(nextLineErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const path = isEditing
        ? `/api/conversations/${conversation?.id}`
        : "/api/conversations";

      await conversationRequest<ConversationDetailItem>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          speaker1: speaker1.trim(),
          speaker2: speaker2.trim(),
          categoryId,
          sequence: Number(sequence),
          isPublished: isPublishedFromStatus(status),
          lines: lines.map((line) => line.text.trim()),
        }),
      });

      onSaved(
        isEditing
          ? "Conversation updated successfully."
          : "Conversation created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the conversation. Please try again.",
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
      title={isEditing ? "Edit conversation" : "New conversation"}
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
          id="conversation-title"
          required
          maxLength={200}
          error={errors.title}
          placeholder="What this conversation is about"
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
              htmlFor="conversation-description"
              className="text-sm font-medium text-slate-800"
            >
              Description
            </label>
            <IoIosStar className="h-2 w-2 text-red-500" />
          </div>
          <textarea
            id="conversation-description"
            name="description"
            required
            rows={3}
            maxLength={500}
            placeholder="Summarise the situation this dialogue practises"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (errors.description) {
                setErrors((current) => ({ ...current, description: undefined }));
              }
              if (apiError) setApiError("");
            }}
            className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
              errors.description
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.description && (
            <span className="mt-0.5 text-xs font-medium text-red-600">
              {errors.description}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Speaker 1 name"
            type="text"
            name="speaker1"
            id="conversation-speaker1"
            required
            maxLength={60}
            error={errors.speaker1}
            placeholder="e.g. Rahim"
            value={speaker1}
            onChange={(event) => {
              setSpeaker1(event.target.value);
              if (errors.speaker1) {
                setErrors((current) => ({ ...current, speaker1: undefined }));
              }
              if (apiError) setApiError("");
            }}
          />
          <Input
            label="Speaker 2 name"
            type="text"
            name="speaker2"
            id="conversation-speaker2"
            required
            maxLength={60}
            error={errors.speaker2}
            placeholder="e.g. Karim"
            value={speaker2}
            onChange={(event) => {
              setSpeaker2(event.target.value);
              if (errors.speaker2) {
                setErrors((current) => ({ ...current, speaker2: undefined }));
              }
              if (apiError) setApiError("");
            }}
          />
        </div>

        <ConversationLineSorter
          lines={lines}
          speaker1={speaker1}
          speaker2={speaker2}
          errors={lineErrors}
          onChange={updateLines}
        />

        <Dropdown
          label="Category"
          id="conversation-category"
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
          id="conversation-status"
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
          id="conversation-sequence"
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
            {isEditing ? "Save changes" : "Create conversation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
