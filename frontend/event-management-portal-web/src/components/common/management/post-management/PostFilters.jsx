import React from "react";
import {
  Search,
  FileText,
  Plus,
  RotateCcw,
} from "lucide-react";

const PostFilters = ({
  title,
  eventTitle,
  count,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  onReset,
  onOpenCreateModal,
  postTypes,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <FileText size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {title}
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              {eventTitle} •{" "}
              <span className="font-medium text-slate-700">
                {count}
              </span>{" "}
              bài viết
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="
            h-11 px-5
            rounded-xl
            bg-blue-600
            text-white
            text-sm font-medium
            hover:bg-blue-700
            transition
            flex items-center justify-center gap-2
            shadow-sm
          "
        >
          <Plus size={17} />
          Tạo bài đăng
        </button>
      </div>

      {/* Filters */}
      <div
        className="
          bg-white
          border border-slate-200
          rounded-2xl
          p-4
          mb-6
          flex flex-col lg:flex-row
          gap-3
          shadow-sm
        "
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="
              w-full h-11
              pl-11 pr-4
              rounded-xl
              border border-slate-200
              bg-slate-50
              text-sm text-slate-700
              outline-none
              focus:border-blue-500
              focus:bg-white
              transition
            "
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
          className="
            h-11 px-4
            rounded-xl
            border border-slate-200
            bg-slate-50
            text-sm text-slate-700
            outline-none
            focus:border-blue-500
            min-w-[190px]
            transition
          "
        >
          <option value="all">
            Mọi loại bài đăng
          </option>

          {Object.entries(postTypes).map(
            ([key, value]) => (
              <option
                key={key}
                value={key}
              >
                {value.label}
              </option>
            )
          )}
        </select>

        {/* Reset */}
        <button
          onClick={onReset}
          className="
            h-11 px-4
            rounded-xl
            border border-slate-200
            bg-white
            text-sm font-medium
            text-slate-600
            hover:bg-slate-50
            hover:text-slate-800
            transition
            flex items-center justify-center gap-2
          "
        >
          <RotateCcw size={15} />
          Đặt lại
        </button>
      </div>
    </>
  );
};

export default PostFilters;
