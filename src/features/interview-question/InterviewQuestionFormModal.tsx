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
import {
  INTERVIEW_DIFFICULTY_OPTIONS,
  parseInterviewDifficulty,
  type InterviewQuestionDifficulty,
  type InterviewQuestionItem,
} from "@/types/interview-question";
import { interviewQuestionRequest } from "./interview-question-client";

const QUESTION_MAX_LENGTH = 500;
const ANSWER_MAX_LENGTH = 8000;

interface InterviewQuestionFormModalProps {
  question: InterviewQuestionItem | null;
  categories: CategoryOption[];
  topics: CategoryOption[];
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormErrors {
  question?: string;
  answer?: string;
  category?: string;
  topic?: string;
  sequence?: string;
}

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: string;
  rows: number;
  maxLength: number;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

function TextAreaField({
  id,
  name,
  label,
  rows,
  maxLength,
  placeholder,
  value,
  error,
  onChange,
}: TextAreaFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-800 max-sm:text-xs"
        >
          {label}
        </label>
        <IoIosStar className="h-2 w-2 text-red-500" />
      </div>
      <textarea
        id={id}
        name={name}
        required
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300"
        }`}
      />
      {error && (
        <span className="mt-0.5 text-xs font-medium text-red-600">{error}</span>
      )}
    </div>
  );
}

export function InterviewQuestionFormModal({
  question,
  categories,
  topics,
  defaultSequence,
  onClose,
  onSaved,
}: InterviewQuestionFormModalProps) {
  const isEditing = Boolean(question);
  const [questionText, setQuestionText] = useState(question?.question ?? "");
  const [answer, setAnswer] = useState(question?.answer ?? "");
  const [categoryId, setCategoryId] = useState(
    question?.categoryId ?? categories[0]?.id ?? "",
  );
  const [topicId, setTopicId] = useState(
    question?.topicId ?? topics[0]?.id ?? "",
  );
  const [difficulty, setDifficulty] = useState<InterviewQuestionDifficulty>(
    question?.difficulty ?? "beginner",
  );
  const [sequence, setSequence] = useState(
    String(question?.sequence ?? defaultSequence),
  );
  const [status, setStatus] = useState(
    publicationStatusValue(question?.isPublished ?? true),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!questionText.trim()) {
      nextErrors.question = "Question is required.";
    }

    if (!answer.trim()) {
      nextErrors.answer = "Answer is required.";
    }

    if (!categoryId) {
      nextErrors.category = "Choose a category.";
    }

    if (!topicId) {
      nextErrors.topic = "Choose a topic.";
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
        ? `/api/interview-questions/${question?.id}`
        : "/api/interview-questions";

      await interviewQuestionRequest<InterviewQuestionItem>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          question: questionText.trim(),
          answer: answer.trim(),
          categoryId,
          topicId,
          difficulty,
          sequence: Number(sequence),
          isPublished: isPublishedFromStatus(status),
        }),
      });

      onSaved(
        isEditing
          ? "Interview question updated successfully."
          : "Interview question created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the interview question. Please try again.",
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

  const saveLabel = isEditing ? "Save Changes" : "Create New";

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={isEditing ? "Edit Interview Question" : "New Interview Question"}
      className="max-w-2xl"
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextAreaField
          id="interview-question"
          name="question"
          label="Question"
          rows={4}
          maxLength={QUESTION_MAX_LENGTH}
          placeholder="Tell me about a time you had to work under a tight deadline"
          value={questionText}
          error={errors.question}
          onChange={(value) => {
            setQuestionText(value);
            clearError("question");
            if (apiError) setApiError("");
          }}
        />

        <TextAreaField
          id="interview-answer"
          name="answer"
          label="Answer"
          rows={10}
          maxLength={ANSWER_MAX_LENGTH}
          placeholder="Write the model answer you want to rehearse"
          value={answer}
          error={errors.answer}
          onChange={(value) => {
            setAnswer(value);
            clearError("answer");
            if (apiError) setApiError("");
          }}
        />

        <Dropdown
          label="Category"
          id="interview-category"
          name="categoryId"
          options={buildCategoryFormOptions(categories)}
          value={categoryId}
          error={errors.category}
          onChange={(value) => {
            setCategoryId(value);
            clearError("category");
            if (apiError) setApiError("");
          }}
          className="max-sm:text-xs"
          required
        />

        <Dropdown
          label="Topic"
          id="interview-topic"
          name="topicId"
          options={buildCategoryFormOptions(topics)}
          value={topicId}
          error={errors.topic}
          onChange={(value) => {
            setTopicId(value);
            clearError("topic");
            if (apiError) setApiError("");
          }}
          className="max-sm:text-xs"
          required
        />

        <Dropdown
          label="Difficulty"
          id="interview-difficulty"
          name="difficulty"
          options={INTERVIEW_DIFFICULTY_OPTIONS}
          value={difficulty}
          onChange={(value) => {
            setDifficulty(parseInterviewDifficulty(value) ?? difficulty);
            if (apiError) setApiError("");
          }}
          className="max-sm:text-xs"
          required
        />

        <Dropdown
          label="Status"
          id="interview-status"
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
          id="interview-sequence"
          required
          min={1}
          max={100000}
          error={errors.sequence}
          value={sequence}
          onChange={(event) => {
            setSequence(event.target.value);
            clearError("sequence");
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
            {saveLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
