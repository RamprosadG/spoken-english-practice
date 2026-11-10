"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { FilterBar } from "@/components/ui/filters/FilterBar";
import SearchInput from "@/components/ui/inputs/SearchInput";
import {
  ALL_TOPICS_LABEL,
  buildCategoryFilterOptions,
} from "@/lib/categories";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";
import { QUESTION_DIFFICULTY_FILTER_OPTIONS } from "@/types/question";

interface QuestionFiltersProps {
  search: string;
  category: string;
  topic: string;
  difficulty: string;
  status: string;
  categories: CategoryOption[];
  topics: CategoryOption[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function QuestionFilters({
  search,
  category,
  topic,
  difficulty,
  status,
  categories,
  topics,
  onSearchChange,
  onCategoryChange,
  onTopicChange,
  onDifficultyChange,
  onStatusChange,
}: QuestionFiltersProps) {
  return (
    <FilterBar rowFrom="xl">
      <SearchInput
        value={search}
        onDebouncedChange={onSearchChange}
        placeholder="Search by question or answer..."
      />
      <Dropdown
        options={buildCategoryFilterOptions(categories)}
        value={category}
        onChange={onCategoryChange}
        hideOptionalText
        className="max-sm:text-xs"
      />
      <Dropdown
        options={buildCategoryFilterOptions(topics, ALL_TOPICS_LABEL)}
        value={topic}
        onChange={onTopicChange}
        hideOptionalText
        className="max-sm:text-xs"
      />
      <Dropdown
        options={QUESTION_DIFFICULTY_FILTER_OPTIONS}
        value={difficulty}
        onChange={onDifficultyChange}
        hideOptionalText
        className="max-sm:text-xs"
      />
      <Dropdown
        options={PUBLICATION_FILTER_OPTIONS}
        value={status}
        onChange={onStatusChange}
        hideOptionalText
        className="max-sm:text-xs"
      />
    </FilterBar>
  );
}
