"use client";

import Dropdown from "@/components/ui/dropdowns/Dropdown";
import SearchInput from "@/components/ui/inputs/SearchInput";
import { useAuth } from "@/features/auth/AuthProvider";
import { PUBLICATION_FILTER_OPTIONS } from "@/lib/publishing";

interface SentenceFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function SentenceFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: SentenceFiltersProps) {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search sentences or meanings..."
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
