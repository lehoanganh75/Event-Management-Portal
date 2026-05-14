import React from "react";

const UserRankingItem = ({ name, events, index }) => {
  return (
    <div
      className="
        flex items-center gap-3
        px-3 py-3
        rounded-xl
        hover:bg-slate-50
        transition-all duration-200
      "
    >
      {/* Rank */}
      <div
        className="
          w-7 h-7
          rounded-lg
          bg-slate-100
          text-slate-500
          text-xs font-semibold
          flex items-center justify-center
          shrink-0
        "
      >
        {index + 1}
      </div>

      {/* Avatar */}
      <div
        className="
          w-11 h-11
          rounded-xl
          bg-gradient-to-br from-[#1E40AF] to-blue-500
          flex items-center justify-center
          text-white
          font-bold
          text-sm
          shadow-sm
          shrink-0
        "
      >
        {name?.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {name}
        </p>

        <p className="text-xs text-slate-400 mt-0.5">
          Người tổ chức nổi bật
        </p>
      </div>

      {/* Events */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#1E40AF]">
          {events}
        </p>

        <p className="text-[11px] text-slate-400">
          sự kiện
        </p>
      </div>
    </div>
  );
};

export default UserRankingItem;