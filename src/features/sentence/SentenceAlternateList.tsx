"use client";

import { FiPlus, FiTrash2 } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";

export interface SentenceAlternateDraft {
  key: string;
  text: string;
}

const ALTERNATE_MAX_LENGTH = 1000;
const MAX_ALTERNATES = 20;

let alternateKeyCounter = 0;

/**
 * Keys anchor React state only. They never travel to the API, where the array
 * order alone defines the stored alternate sequence.
 */
export function createAlternateKey() {
  alternateKeyCounter += 1;
  return `alternate-${alternateKeyCounter}`;
}

interface SentenceAlternateListProps {
  alternates: SentenceAlternateDraft[];
  errors: Record<string, string>;
  onChange: (alternates: SentenceAlternateDraft[]) => void;
}

export function SentenceAlternateList({
  alternates,
  errors,
  onChange,
}: SentenceAlternateListProps) {
  const handleTextChange = (key: string, text: string) => {
    onChange(
      alternates.map((alternate) =>
        alternate.key === key ? { ...alternate, text } : alternate,
      ),
    );
  };

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        Alternate expressions
      </legend>
      <p className="text-xs text-slate-500">
        Other ways to say the same thing. Each saved expression gets its own
        Listen button in the practice panel.
      </p>

      {alternates.length > 0 && (
        <ul className="mt-3 flex flex-col gap-3">
          {alternates.map((alternate, index) => (
            <li
              key={alternate.key}
              className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  Expression {index + 1}
                </p>

                <textarea
                  id={`sentence-alternate-${alternate.key}`}
                  name={`alternate-${index}`}
                  rows={2}
                  maxLength={ALTERNATE_MAX_LENGTH}
                  placeholder="Type another way to say it"
                  aria-label={`Alternate expression ${index + 1} text`}
                  value={alternate.text}
                  onChange={(event) =>
                    handleTextChange(alternate.key, event.target.value)
                  }
                  className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                    errors[alternate.key]
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />

                {errors[alternate.key] && (
                  <span className="mt-0.5 block text-xs font-medium text-red-600">
                    {errors[alternate.key]}
                  </span>
                )}
              </div>

              <TableActionButton
                tooltip={`Remove expression ${index + 1}`}
                color="rose"
                onClick={() =>
                  onChange(alternates.filter((item) => item.key !== alternate.key))
                }
              >
                <FiTrash2 className="w-4 h-4" />
              </TableActionButton>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="white"
        onClick={() =>
          onChange([...alternates, { key: createAlternateKey(), text: "" }])
        }
        disabled={alternates.length >= MAX_ALTERNATES}
        icon={<FiPlus className="h-4 w-4" />}
        className="mt-4 w-full sm:w-auto"
      >
        Add expression
      </Button>
    </fieldset>
  );
}
