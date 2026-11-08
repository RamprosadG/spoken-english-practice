import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageInfo?: boolean;
  total?: number;
  limit?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showPageInfo = true,
  total,
  limit,
}) => {

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = total && limit ? (currentPage - 1) * limit + 1 : 0;
  const endItem = total && limit ? Math.min(currentPage * limit, total) : 0;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {showPageInfo && total !== undefined && limit !== undefined && (
        <p className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {total} entries
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors max-sm:h-8 max-sm:px-1.5"
          aria-label="Previous Page"
        >
          <IoChevronBack className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5" />
        </button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-gray-500 max-sm:px-1.5">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`inline-flex h-9 min-w-10 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors max-sm:h-8 max-sm:min-w-8 max-sm:px-2 max-sm:text-xs ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors max-sm:h-8 max-sm:px-1.5"
          aria-label="Next Page"
        >
          <IoChevronForward className="w-4 h-4 max-sm:w-3.5 max-sm:h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
