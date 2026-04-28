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

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                currentPage === num 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
                  : "bg-white border border-gray-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

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
