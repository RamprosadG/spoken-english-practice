"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { IoIosStar } from "react-icons/io";
import Button from "@/components/ui/buttons/Button";
import Input from "@/components/ui/inputs/Input";
import Modal from "@/components/ui/modals/Modal";
import type { VocabularyItem } from "@/types/vocabulary";
import { vocabularyRequest } from "./vocabulary-client";

interface VocabularyFormModalProps {
  vocabulary: VocabularyItem | null;
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormState {
  text: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  synonymText: string;
  synonymMeaning: string;
  synonymSentence: string;
  synonymSentenceMeaning: string;
  antonymText: string;
  antonymMeaning: string;
  antonymSentence: string;
  antonymSentenceMeaning: string;
  sequence: string;
}

type FormField = keyof FormState;
type FormErrors = Partial<Record<FormField, string>>;

function buildInitialState(
  vocabulary: VocabularyItem | null,
  defaultSequence: number,
): FormState {
  return {
    text: vocabulary?.text ?? "",
    meaning: vocabulary?.meaning ?? "",
    sentence: vocabulary?.sentence ?? "",
    sentenceMeaning: vocabulary?.sentenceMeaning ?? "",
    synonymText: vocabulary?.synonymText ?? "",
    synonymMeaning: vocabulary?.synonymMeaning ?? "",
    synonymSentence: vocabulary?.synonymSentence ?? "",
    synonymSentenceMeaning: vocabulary?.synonymSentenceMeaning ?? "",
    antonymText: vocabulary?.antonymText ?? "",
    antonymMeaning: vocabulary?.antonymMeaning ?? "",
    antonymSentence: vocabulary?.antonymSentence ?? "",
    antonymSentenceMeaning: vocabulary?.antonymSentenceMeaning ?? "",
    sequence: String(vocabulary?.sequence ?? defaultSequence),
  };
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  lang?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  error?: string;
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  required = false,
  lang,
  rows = 3,
  maxLength = 1000,
  placeholder,
  error,
}: TextAreaFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
        </label>
        {required && <IoIosStar className="h-2 w-2 text-red-500" />}
      </div>
      <textarea
        id={id}
        name={id}
        rows={rows}
        maxLength={maxLength}
        lang={lang}
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
        <span className="mt-0.5 text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function VocabularyFormModal({
  vocabulary,
  defaultSequence,
  onClose,
  onSaved,
}: VocabularyFormModalProps) {
  const isEditing = Boolean(vocabulary);
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(vocabulary, defaultSequence),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField(field: FormField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    if (apiError) setApiError("");
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.text.trim()) {
      nextErrors.text = "Word is required.";
    }
    if (!form.meaning.trim()) {
      nextErrors.meaning = "Bengali meaning is required.";
    }
    if (!form.sentence.trim()) {
      nextErrors.sentence = "Example sentence is required.";
    }
    if (!form.sentenceMeaning.trim()) {
      nextErrors.sentenceMeaning =
        "Bengali meaning of the example sentence is required.";
    }

    const parsedSequence = Number(form.sequence);
    if (!Number.isInteger(parsedSequence) || parsedSequence < 1) {
      nextErrors.sequence = "Sequence must be a whole number of at least 1.";
    }

    if (
      !form.synonymText.trim() &&
      (form.synonymMeaning.trim() ||
        form.synonymSentence.trim() ||
        form.synonymSentenceMeaning.trim())
    ) {
      nextErrors.synonymText =
        "Enter the synonym word to use its details.";
    }

    if (
      !form.antonymText.trim() &&
      (form.antonymMeaning.trim() ||
        form.antonymSentence.trim() ||
        form.antonymSentenceMeaning.trim())
    ) {
      nextErrors.antonymText =
        "Enter the antonym word to use its details.";
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
        ? `/api/vocabulary/${vocabulary?.id}`
        : "/api/vocabulary";

      await vocabularyRequest<VocabularyItem>(path, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          text: form.text.trim(),
          meaning: form.meaning.trim(),
          sentence: form.sentence.trim(),
          sentenceMeaning: form.sentenceMeaning.trim(),
          synonymText: form.synonymText.trim() || null,
          synonymMeaning: form.synonymMeaning.trim() || null,
          synonymSentence: form.synonymSentence.trim() || null,
          synonymSentenceMeaning:
            form.synonymSentenceMeaning.trim() || null,
          antonymText: form.antonymText.trim() || null,
          antonymMeaning: form.antonymMeaning.trim() || null,
          antonymSentence: form.antonymSentence.trim() || null,
          antonymSentenceMeaning:
            form.antonymSentenceMeaning.trim() || null,
          sequence: Number(form.sequence),
        }),
      });

      onSaved(
        isEditing
          ? "Vocabulary updated successfully."
          : "Vocabulary created successfully.",
      );
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to save the vocabulary. Please try again.",
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
      title={isEditing ? "Edit vocabulary" : "New vocabulary"}
      className="max-w-3xl"
    >
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Word"
            id="vocabulary-text"
            name="text"
            required
            maxLength={100}
            placeholder="Write the English word"
            value={form.text}
            error={errors.text}
            onChange={(event) => setField("text", event.target.value)}
          />
          <Input
            label="Bengali meaning"
            id="vocabulary-meaning"
            name="meaning"
            required
            lang="bn"
            maxLength={500}
            placeholder="Write the Bengali meaning of the word"
            value={form.meaning}
            error={errors.meaning}
            onChange={(event) => setField("meaning", event.target.value)}
          />
        </div>

        <TextAreaField
          id="vocabulary-sentence"
          label="Example sentence"
          required
          rows={3}
          placeholder="Write an example sentence using the word"
          value={form.sentence}
          error={errors.sentence}
          onChange={(value) => setField("sentence", value)}
        />

        <TextAreaField
          id="vocabulary-sentence-meaning"
          label="Example sentence meaning (বাংলা)"
          required
          lang="bn"
          rows={3}
          placeholder="Write the Bengali meaning of the example sentence"
          value={form.sentenceMeaning}
          error={errors.sentenceMeaning}
          onChange={(value) => setField("sentenceMeaning", value)}
        />

        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">
            Synonym{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </legend>
          <p className="text-xs text-slate-500">
            Add a related word with its own meaning and example.
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              label="Synonym word"
              id="vocabulary-synonym-text"
              name="synonymText"
              maxLength={100}
              placeholder="e.g. begin"
              value={form.synonymText}
              error={errors.synonymText}
              onChange={(event) =>
                setField("synonymText", event.target.value)
              }
            />
            <Input
              label="Bengali meaning"
              id="vocabulary-synonym-meaning"
              name="synonymMeaning"
              lang="bn"
              maxLength={500}
              placeholder="Write the Bengali meaning"
              value={form.synonymMeaning}
              onChange={(event) =>
                setField("synonymMeaning", event.target.value)
              }
            />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <TextAreaField
              id="vocabulary-synonym-sentence"
              label="Example sentence"
              rows={2}
              placeholder="Write an example with the synonym"
              value={form.synonymSentence}
              onChange={(value) => setField("synonymSentence", value)}
            />
            <TextAreaField
              id="vocabulary-synonym-sentence-meaning"
              label="Sentence meaning (বাংলা)"
              lang="bn"
              rows={2}
              placeholder="Write the Bengali meaning of the example"
              value={form.synonymSentenceMeaning}
              onChange={(value) =>
                setField("synonymSentenceMeaning", value)
              }
            />
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">
            Antonym{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </legend>
          <p className="text-xs text-slate-500">
            Add an opposite word with its own meaning and example.
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              label="Antonym word"
              id="vocabulary-antonym-text"
              name="antonymText"
              maxLength={100}
              placeholder="e.g. finish"
              value={form.antonymText}
              error={errors.antonymText}
              onChange={(event) =>
                setField("antonymText", event.target.value)
              }
            />
            <Input
              label="Bengali meaning"
              id="vocabulary-antonym-meaning"
              name="antonymMeaning"
              lang="bn"
              maxLength={500}
              placeholder="Write the Bengali meaning"
              value={form.antonymMeaning}
              onChange={(event) =>
                setField("antonymMeaning", event.target.value)
              }
            />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <TextAreaField
              id="vocabulary-antonym-sentence"
              label="Example sentence"
              rows={2}
              placeholder="Write an example with the antonym"
              value={form.antonymSentence}
              onChange={(value) => setField("antonymSentence", value)}
            />
            <TextAreaField
              id="vocabulary-antonym-sentence-meaning"
              label="Sentence meaning (বাংলা)"
              lang="bn"
              rows={2}
              placeholder="Write the Bengali meaning of the example"
              value={form.antonymSentenceMeaning}
              onChange={(value) =>
                setField("antonymSentenceMeaning", value)
              }
            />
          </div>
        </fieldset>

        <Input
          label="Sequence"
          type="number"
          id="vocabulary-sequence"
          name="sequence"
          required
          min={1}
          max={100000}
          className="sm:max-w-[220px]"
          value={form.sequence}
          error={errors.sequence}
          onChange={(event) => setField("sequence", event.target.value)}
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
            {isEditing ? "Save changes" : "Create vocabulary"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
