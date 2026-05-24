import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems,
  startIndex
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2">
      {totalItems !== undefined && (
        <p className="text-sm text-slate-500 font-medium italic">
          Hiển thị <span className="text-slate-900 font-bold">{startIndex + 1}</span>–
          <span className="text-slate-900 font-bold">{Math.min(startIndex + itemsPerPage, totalItems)}</span> của{" "}
          <span className="text-slate-900 font-bold">{totalItems}</span> mục
        </p>
      )}
      
      <div className="flex justify-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all bg-white shadow-sm"
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
        </button>

        <span className="h-10 px-4 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-sm font-extrabold text-slate-700 shadow-sm select-none">
          {currentPage}/{totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all bg-white shadow-sm"
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
