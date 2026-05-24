import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      {/* Prev */}
      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.max(1, p - 1)
          )
        }
        disabled={currentPage === 1}
        className="
          w-10 h-10
          flex items-center justify-center
          rounded-lg
          border border-slate-200
          bg-white
          text-slate-500
          hover:border-blue-300
          hover:text-[#1E40AF]
          hover:bg-blue-50/40
          disabled:opacity-40
          disabled:hover:border-slate-200
          disabled:hover:bg-white
          transition
        "
      >
        <ChevronLeft size={18} />
      </button>

      <span className="h-10 px-4 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-sm font-extrabold text-slate-700 shadow-sm select-none">
        {currentPage}/{totalPages}
      </span>

      {/* Next */}
      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(totalPages, p + 1)
          )
        }
        disabled={
          currentPage === totalPages
        }
        className="
          w-10 h-10
          flex items-center justify-center
          rounded-lg
          border border-slate-200
          bg-white
          text-slate-500
          hover:border-blue-300
          hover:text-[#1E40AF]
          hover:bg-blue-50/40
          disabled:opacity-40
          disabled:hover:border-slate-200
          disabled:hover:bg-white
          transition
        "
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
