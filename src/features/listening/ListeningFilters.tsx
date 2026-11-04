"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/features/auth/AuthProvider";
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
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search by title..."
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
