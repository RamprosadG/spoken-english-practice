"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { FilterBar } from "@/components/ui/filters/FilterBar";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { buildCategoryFilterOptions } from "@/lib/categories";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";

interface ConversationFiltersProps {
  search: string;
  category: string;
  status: string;
  categories: CategoryOption[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ConversationFilters({
  search,
  category,
  status,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: ConversationFiltersProps) {
  const { user } = useAuth();

  return (
    <FilterBar>
      <SearchInput
        value={search}
        onDebouncedChange={onSearchChange}
        placeholder="Search by title, description, or speaker name..."
      />
      <Dropdown
        options={buildCategoryFilterOptions(categories)}
        value={category}
        onChange={onCategoryChange}
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
