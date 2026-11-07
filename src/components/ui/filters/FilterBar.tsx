import React from "react";

type FilterBarBreakpoint = "md" | "xl";

const ROW_CLASSES: Record<FilterBarBreakpoint, string> = {
  md: "md:flex md:flex-row md:items-center md:gap-4",
  xl: "xl:flex xl:flex-row xl:items-center xl:gap-4",
};

const SEARCH_CLASSES: Record<FilterBarBreakpoint, string> = {
  md: "md:flex-1",
  xl: "xl:flex-1",
};

const PILL_CLASSES: Record<FilterBarBreakpoint, string> = {
  md: "md:w-40 md:shrink-0",
  xl: "xl:w-40 xl:shrink-0",
};

interface FilterBarProps {
  /** The width at which the controls go back to one horizontal row. */
  rowFrom?: FilterBarBreakpoint;
  children: React.ReactNode;
}

/**
 * Filter controls laid out by how many there are, because the count is
 * role-dependent: an even number puts two per row, an odd number gives the
 * first control a full row of its own and pairs the rest. The search box is
 * always the first control, so the wide slot it takes when the count is odd is
 * the one it keeps once the controls collapse into a single row.
 */
export function FilterBar({ rowFrom = "md", children }: FilterBarProps) {
  const controls = React.Children.toArray(children);
  // An odd count leaves one control without a partner, so the first one — the
  // search box — takes the whole row instead of starting a pair.
  const firstSpansRow = controls.length % 2 === 1;

  return (
    <div className={`mt-3 grid w-full grid-cols-2 gap-3 ${ROW_CLASSES[rowFrom]}`}>
      {controls.map((control, index) => {
        const isSearch = index === 0;
        const cellClasses = [
          isSearch && firstSpansRow ? "col-span-2" : null,
          "min-w-0",
          isSearch ? SEARCH_CLASSES[rowFrom] : PILL_CLASSES[rowFrom],
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={index} className={cellClasses}>
            {control}
          </div>
        );
      })}
    </div>
  );
}
