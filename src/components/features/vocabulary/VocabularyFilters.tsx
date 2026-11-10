"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { FilterBar } from "@/components/ui/filters/FilterBar";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { buildCategoryFilterOptions } from "@/lib/categories";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";

const LETTER_OPTIONS = [
  { value: "", label: "All Letter" },
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
    <FilterBar>
      <SearchInput
        value={search}
        onDebouncedChange={onSearchChange}
        placeholder="Search words or example sentences..."
      />
      <Dropdown
        options={buildCategoryFilterOptions(categories)}
        value={category}
        onChange={onCategoryChange}
        className="max-sm:text-xs"
        hideOptionalText
      />
      <Dropdown
        options={LETTER_OPTIONS}
        value={letter}
        onChange={onLetterChange}
        className="max-sm:text-xs"
        hideOptionalText
      />
      {user?.role === "admin" && (
        <Dropdown
          options={PUBLICATION_FILTER_OPTIONS}
          value={status}
          onChange={onStatusChange}
          className="max-sm:text-xs"
          hideOptionalText
        />
      )}
    </FilterBar>
  );
}
