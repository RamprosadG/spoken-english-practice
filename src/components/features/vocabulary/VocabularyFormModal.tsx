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
  PARTS_OF_SPEECH_OPTIONS,
  type VocabularyItem,
} from "@/types/vocabulary";
import {
  VocabularyRelatedWordList,
  createRelatedWordKey,
  type VocabularyRelatedWordDraft,
  type VocabularyRelatedWordErrors,
} from "./VocabularyRelatedWordList";
import { vocabularyRequest } from "./vocabulary-client";

interface VocabularyFormModalProps {
  vocabulary: VocabularyItem | null;
  categories: CategoryOption[];
  defaultSequence: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormState {
  text: string;
  meaning: string;
  sentence: string;
  sentenceMeaning: string;
  categoryId: string;
  partsOfSpeech: string;
  status: string;
  sequence: string;
}

type FormField = keyof FormState;
type FormErrors = Partial<Record<FormField, string>>;
type RelatedErrors = Record<string, VocabularyRelatedWordErrors>;

function buildInitialState(
  vocabulary: VocabularyItem | null,
  categories: CategoryOption[],
  defaultSequence: number,
): FormState {
  return {
    text: vocabulary?.text ?? "",
    meaning: vocabulary?.meaning ?? "",
    sentence: vocabulary?.sentence ?? "",
    sentenceMeaning: vocabulary?.sentenceMeaning ?? "",
    categoryId: vocabulary?.categoryId ?? categories[0]?.id ?? "",
    partsOfSpeech: vocabulary?.partsOfSpeech ?? "noun",
    status: publicationStatusValue(vocabulary?.isPublished ?? true),
    sequence: String(vocabulary?.sequence ?? defaultSequence),
  };
}

function buildRelatedDrafts(
  words: VocabularyItem["synonyms"],
): VocabularyRelatedWordDraft[] {
  return words.map((word) => ({
    key: createRelatedWordKey(),
    word: word.word,
    sentence: word.sentence,
  }));
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
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-800 max-sm:text-xs"
        >
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
  categories,
  defaultSequence,
  onClose,
  onSaved,
}: VocabularyFormModalProps) {
  const isEditing = Boolean(vocabulary);
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(vocabulary, categories, defaultSequence),
  );
  const [synonyms, setSynonyms] = useState<VocabularyRelatedWordDraft[]>(() =>
    buildRelatedDrafts(vocabulary?.synonyms ?? []),
  );
  const [antonyms, setAntonyms] = useState<VocabularyRelatedWordDraft[]>(() =>
    buildRelatedDrafts(vocabulary?.antonyms ?? []),
  );
  const [synonymErrors, setSynonymErrors] = useState<RelatedErrors>({});
  const [antonymErrors, setAntonymErrors] = useState<RelatedErrors>({});
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

  function validateRelated(
    label: string,
    words: VocabularyRelatedWordDraft[],
  ): [RelatedErrors, number] {
    const next: RelatedErrors = {};

    words.forEach((word, index) => {
      const rowErrors: VocabularyRelatedWordErrors = {};
      if (!word.word.trim()) {
        rowErrors.word = `${label} ${index + 1} is empty.`;
      }
      if (!word.sentence.trim()) {
        rowErrors.sentence = `${label} ${index + 1} has no example sentence.`;
      }
      if (Object.keys(rowErrors).length > 0) {
        next[word.key] = rowErrors;
      }
    });

    return [next, Object.keys(next).length];
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
    if (!form.categoryId) {
      nextErrors.categoryId = "Choose a category.";
    }

    const parsedSequence = Number(form.sequence);
    if (!Number.isInteger(parsedSequence) || parsedSequence < 1) {
      nextErrors.sequence = "Sequence must be a whole number of at least 1.";
    }

    const [nextSynonymErrors, synonymErrorCount] = validateRelated(
      "Synonym",
      synonyms,
    );
    const [nextAntonymErrors, antonymErrorCount] = validateRelated(
      "Antonym",
      antonyms,
    );

    setErrors(nextErrors);
    setSynonymErrors(nextSynonymErrors);
    setAntonymErrors(nextAntonymErrors);

    return (
      Object.keys(nextErrors).length === 0 &&
      synonymErrorCount === 0 &&
      antonymErrorCount === 0
    );
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
          categoryId: form.categoryId,
          sequence: Number(form.sequence),
          isPublished: isPublishedFromStatus(form.status),
          partsOfSpeech: form.partsOfSpeech,
          synonyms: synonyms.map((synonym) => ({
            word: synonym.word.trim(),
            sentence: synonym.sentence.trim(),
          })),
          antonyms: antonyms.map((antonym) => ({
            word: antonym.word.trim(),
            sentence: antonym.sentence.trim(),
          })),
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
      title={isEditing ? "Edit Vocabulary" : "New Vocabulary"}
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
            label="Bengali Meaning"
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
          label="Example Sentence"
          required
          rows={3}
          placeholder="Write an example sentence using the word"
          value={form.sentence}
          error={errors.sentence}
          onChange={(value) => setField("sentence", value)}
        />

        <TextAreaField
          id="vocabulary-sentence-meaning"
          label="Example Sentence Meaning (বাংলা)"
          required
          lang="bn"
          rows={3}
          placeholder="Write the Bengali meaning of the example sentence"
          value={form.sentenceMeaning}
          error={errors.sentenceMeaning}
          onChange={(value) => setField("sentenceMeaning", value)}
        />

        <VocabularyRelatedWordList
          singular="Synonym"
          hint="Words that mean the same as this one. Each entry keeps its own example sentence, IPA and audio."
          words={synonyms}
          errors={synonymErrors}
          onChange={(next) => {
            setSynonyms(next);
            setSynonymErrors({});
            if (apiError) setApiError("");
          }}
        />

        <VocabularyRelatedWordList
          singular="Antonym"
          hint="Words that mean the opposite of this one. Each entry keeps its own example sentence, IPA and audio."
          words={antonyms}
          errors={antonymErrors}
          onChange={(next) => {
            setAntonyms(next);
            setAntonymErrors({});
            if (apiError) setApiError("");
          }}
        />

        <Dropdown
          label="Category"
          id="vocabulary-category"
          name="categoryId"
          options={buildCategoryFormOptions(categories)}
          value={form.categoryId}
          error={errors.categoryId}
          onChange={(value) => setField("categoryId", value)}
          className="max-sm:text-xs"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Dropdown
            label="Part Of Speech"
            id="vocabulary-parts-of-speech"
            name="partsOfSpeech"
            options={PARTS_OF_SPEECH_OPTIONS}
            value={form.partsOfSpeech}
            onChange={(value) => setField("partsOfSpeech", value)}
            className="max-sm:text-xs"
            required
          />
          <Dropdown
            label="Status"
            id="vocabulary-status"
            name="isPublished"
            options={PUBLICATION_FORM_OPTIONS}
            value={form.status}
            onChange={(value) => setField("status", value)}
            className="max-sm:text-xs"
            required
          />
        </div>

        <Input
          label="Sequence"
          type="number"
          id="vocabulary-sequence"
          name="sequence"
          required
          min={1}
          max={100000}
          value={form.sequence}
          error={errors.sequence}
          onChange={(event) => setField("sequence", event.target.value)}
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
