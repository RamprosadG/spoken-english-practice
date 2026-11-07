"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { FilterBar } from "@/components/ui/filters/FilterBar";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/features/auth/AuthProvider";
import { buildCategoryFilterOptions } from "@/lib/categories";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";
import type { CategoryOption } from "@/types/category";

interface PresentationFiltersProps {
  search: string;
  category: string;
  status: string;
  categories: CategoryOption[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function PresentationFilters({
  search,
  category,
  status,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: PresentationFiltersProps) {
  const { user } = useAuth();
  const categoryOptions = buildCategoryFilterOptions(categories);

  return (
    <FilterBar>
      <SearchInput
        value={search}
        onDebouncedChange={onSearchChange}
        placeholder="Search by presentation title..."
      />
      <Dropdown
        options={categoryOptions}
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
