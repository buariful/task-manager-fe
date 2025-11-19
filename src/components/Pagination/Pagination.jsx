import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // helper: generate page numbers with dots
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // how many pages around current to show

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4">
      {/* Records info */}
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * limit + 1} -{" "}
        {Math.min(currentPage * limit, totalRecords)} of {totalRecords} records
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-accent disabled:text-gray-400"
        >
          {/* &lt; */}
          <IoIosArrowBack />
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(page)}
            className={`px-3 py-1 rounded ${
              page === currentPage
                ? "bg-custom-gray text-white"
                : "bg-white text-accent hover:bg-gray-100"
            }`}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-accent disabled:text-gray-400"
        >
          <IoIosArrowForward />
          {/* &gt; */}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
