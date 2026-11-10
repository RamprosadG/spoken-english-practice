"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { FilterBar } from "@/components/ui/filters/FilterBar";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { LEARNER_ROLE_FILTER_OPTIONS } from "@/types/learner";

interface LearnerFiltersProps {
  search: string;
  role: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export function LearnerFilters({
  search,
  role,
  onSearchChange,
  onRoleChange,
}: LearnerFiltersProps) {
  return (
    <FilterBar>
      <SearchInput
        value={search}
        onDebouncedChange={onSearchChange}
        placeholder="Search by name or email..."
      />
      <Dropdown
        options={LEARNER_ROLE_FILTER_OPTIONS}
        value={role}
        onChange={onRoleChange}
        hideOptionalText
        className="max-sm:text-xs"
      />
    </FilterBar>
  );
}
