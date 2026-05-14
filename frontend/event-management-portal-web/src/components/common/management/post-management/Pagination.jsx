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

      {/* Pages */}
      <div className="flex items-center gap-2">
        {Array.from(
          { length: totalPages },
          (_, i) => i + 1
        ).map((num) => {
          const active =
            currentPage === num;

          return (
            <button
              key={num}
              onClick={() =>
                setCurrentPage(num)
              }
              className={`
                w-10 h-10
                rounded-lg
                text-sm font-medium
                border
                transition
                ${active
                  ? `
                      bg-[#1E40AF]
                      border-[#1E40AF]
                      text-white
                      shadow-sm
                    `
                  : `
                      bg-white
                      border-slate-200
                      text-slate-600
                      hover:border-blue-300
                      hover:text-[#1E40AF]
                      hover:bg-blue-50/40
                    `
                }
              `}
            >
              {num}
            </button>
          );
        })}
      </div>

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