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
import { INTERVIEW_DIFFICULTY_FILTER_OPTIONS } from "@/types/interview-question";

interface InterviewQuestionFiltersProps {
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

export function InterviewQuestionFilters({
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
}: InterviewQuestionFiltersProps) {
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
      />
      <Dropdown
        options={buildCategoryFilterOptions(topics, ALL_TOPICS_LABEL)}
        value={topic}
        onChange={onTopicChange}
        hideOptionalText
      />
      <Dropdown
        options={INTERVIEW_DIFFICULTY_FILTER_OPTIONS}
        value={difficulty}
        onChange={onDifficultyChange}
        hideOptionalText
      />
      <Dropdown
        options={PUBLICATION_FILTER_OPTIONS}
        value={status}
        onChange={onStatusChange}
        hideOptionalText
      />
    </FilterBar>
  );
}
