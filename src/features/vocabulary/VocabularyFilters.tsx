"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import SearchInput from "@/components/ui/inputs/SearchInput";

const LETTER_OPTIONS = [
  { value: "", label: "All letters" },
  ...Array.from({ length: 26 }, (_, index) => {
    const letter = String.fromCharCode(65 + index);
    return { value: letter, label: letter };
  }),
];

interface VocabularyFiltersProps {
  search: string;
  letter: string;
  onSearchChange: (value: string) => void;
  onLetterChange: (value: string) => void;
}

export function VocabularyFilters({
  search,
  letter,
  onSearchChange,
  onLetterChange,
}: VocabularyFiltersProps) {
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
          options={LETTER_OPTIONS}
          value={letter}
          onChange={onLetterChange}
          hideOptionalText
        />
      </div>
    </div>
  );
}
