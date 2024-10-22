import React, { useState, useEffect } from "react";

interface PaginationProps {
  total: number; // Total number of pages
  initialPage: number; // Current active page
  perPage: number; // Items per page
  onPageChange: (page: number, perPage: number) => void; // Callback for page and perPage change
}

const Pagination: React.FC<PaginationProps> = ({
  total,
  initialPage,
  perPage,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPerPage, setCurrentPerPage] = useState(perPage);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);
  const itemsPerPageOptions = [5, 10, 20, 50]; // Dropdown options
  const visibleRange = 10; // Number of visible pages in a chunk

  // Function to update the visible pages based on the current page
  const updateVisiblePages = (page: number) => {
    // Calculate the chunk for visible pages
    const start = Math.floor((page - 1) / visibleRange) * visibleRange + 1;
    const end = Math.min(start + visibleRange - 1, total);

    // Generate visible page numbers
    setVisiblePages(
      Array.from({ length: end - start + 1 }, (_, i) => start + i),
    );
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    onPageChange(page, currentPerPage);
    updateVisiblePages(page);
  };

  const handlePerPageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(e.target.value, 10);
    setCurrentPerPage(newPerPage);
    onPageChange(1, newPerPage); // Reset to page 1 when perPage changes
    updateVisiblePages(1);
  };

  useEffect(() => {
    updateVisiblePages(initialPage);
  }, [initialPage]);

  return (
    <div className="flex items-center justify-between space-x-2 py-3">
      {/* Page Navigation */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`rounded-md px-2 py-1 text-sm ${
            currentPage === 1
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>

        {/* Visible Page Numbers */}
        <div className="flex space-x-1">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`rounded-md border px-2 py-1 text-sm ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === total}
          className={`rounded-md px-2 py-1 text-sm ${
            currentPage === total
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>

      {/* Items Per Page Selector */}
      <select
        value={currentPerPage}
        onChange={handlePerPageSelect}
        className="rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {itemsPerPageOptions.map((option) => (
          <option key={option} value={option}>
            {option} / page
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
