"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/features/auth/AuthProvider";
import { buildCategoryFilterOptions } from "@/lib/categories";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";

const LETTER_OPTIONS = [
  { value: "", label: "All letters" },
  ...Array.from({ length: 26 }, (_, index) => {
    const letter = String.fromCharCode(65 + index);
    return { value: letter, label: letter };
  }),
];

interface VocabularyFiltersProps {
  search: string;
  category: string;
  letter: string;
  status: string;
  categories: CategoryOption[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLetterChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function VocabularyFilters({
  search,
  category,
  letter,
  status,
  categories,
  onSearchChange,
  onCategoryChange,
  onLetterChange,
  onStatusChange,
}: VocabularyFiltersProps) {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-stretch md:items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search words, synonyms or antonyms..."
        />
      </div>
      <div className="w-full md:w-40 shrink-0">
        <Dropdown
          options={buildCategoryFilterOptions(categories)}
          value={category}
          onChange={onCategoryChange}
          hideOptionalText
        />
      </div>
      <div className="w-full md:w-40 shrink-0">
        <Dropdown
          options={LETTER_OPTIONS}
          value={letter}
          onChange={onLetterChange}
          hideOptionalText
        />
      </div>
      {user?.role === "admin" && (
        <div className="w-full md:w-40 shrink-0">
          <Dropdown
            options={PUBLICATION_FILTER_OPTIONS}
            value={status}
            onChange={onStatusChange}
            hideOptionalText
          />
        </div>
      )}
    </div>
  );
}
