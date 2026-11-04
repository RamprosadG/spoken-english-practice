"use client";

import SearchInput from "@/components/ui/inputs/SearchInput";

interface ConversationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ConversationFilters({
  search,
  onSearchChange,
}: ConversationFiltersProps) {
  return (
    <div className="w-full flex flex-col md:flex-row mt-3 gap-4 items-center">
      <div className="flex-1 w-full min-w-0">
        <SearchInput
          value={search}
          onDebouncedChange={onSearchChange}
          placeholder="Search by title, description, or speaker name..."
        />
      </div>
    </div>
  );
}
