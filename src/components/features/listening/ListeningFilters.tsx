"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { FilterBar } from "@/components/ui/filters/FilterBar";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { buildCategoryFilterOptions } from "@/lib/categories";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";

interface ListeningFiltersProps {
  search: string;
  category: string;
  status: string;
  categories: CategoryOption[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ListeningFilters({
  search,
  category,
  status,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: ListeningFiltersProps) {
  const { user } = useAuth();

  return (
    <FilterBar>
      <SearchInput
        value={search}
        onDebouncedChange={onSearchChange}
        placeholder="Search by title..."
      />
      <Dropdown
        options={buildCategoryFilterOptions(categories)}
        value={category}
        onChange={onCategoryChange}
        hideOptionalText
        className="max-sm:text-xs"
      />
      {user?.role === "admin" && (
        <Dropdown
          options={PUBLICATION_FILTER_OPTIONS}
          value={status}
          onChange={onStatusChange}
          hideOptionalText
          className="max-sm:text-xs"
        />
      )}
    </FilterBar>
  );
}
