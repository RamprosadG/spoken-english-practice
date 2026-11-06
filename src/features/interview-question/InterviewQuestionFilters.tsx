"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
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
    <div className="w-full flex flex-col gap-4 mt-3 xl:flex-row xl:items-center">
      <div className="w-full min-w-0 xl:flex-1">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search by question or answer..."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:w-auto">
        <div className="min-w-0">
          <Dropdown
            options={buildCategoryFilterOptions(categories)}
            value={category}
            onChange={onCategoryChange}
            hideOptionalText
          />
        </div>
        <div className="min-w-0">
          <Dropdown
            options={buildCategoryFilterOptions(topics, ALL_TOPICS_LABEL)}
            value={topic}
            onChange={onTopicChange}
            hideOptionalText
          />
        </div>
        <div className="min-w-0">
          <Dropdown
            options={INTERVIEW_DIFFICULTY_FILTER_OPTIONS}
            value={difficulty}
            onChange={onDifficultyChange}
            hideOptionalText
          />
        </div>
        <div className="min-w-0">
          <Dropdown
            options={PUBLICATION_FILTER_OPTIONS}
            value={status}
            onChange={onStatusChange}
            hideOptionalText
          />
        </div>
      </div>
    </div>
  );
}
