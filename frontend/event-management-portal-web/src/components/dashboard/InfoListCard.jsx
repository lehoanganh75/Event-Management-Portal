import React from "react";

const InfoListCard = ({
  title,
  icon: Icon,
  items = [],
  iconColor = "text-[#1E40AF]",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Icon size={19} className={iconColor} strokeWidth={2.2} />
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-sm">
            {title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Danh sách nổi bật
          </p>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-2">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <span className="text-sm text-slate-700 font-medium truncate">
                  {item.label}
                </span>
              </div>

              <span
                className={`
                  text-sm font-semibold shrink-0
                  ${String(item.value || "").includes("♥")
                    ? "text-pink-600"
                    : "text-slate-700"
                  }
                `}
              >
                {item.value !== undefined ? item.value : item.label}
              </span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-slate-400 bg-slate-50 rounded-xl">
            Không có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoListCard;
