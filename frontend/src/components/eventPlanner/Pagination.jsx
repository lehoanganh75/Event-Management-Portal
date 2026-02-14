import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>
      
      <span className="text-sm font-bold text-slate-500">
        Trang {currentPage + 1} / {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};