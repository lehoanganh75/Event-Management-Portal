import React from "react";
import {
  TrendingUp,
  Calendar,
  Heart,
  Eye,
} from "lucide-react";

const InfoListCard = ({
  title,
  icon: Icon,
  items = [],
  color,
}) => {
  const getItemLabel = (item) => {
    if (
      typeof item === "string" ||
      typeof item === "number"
    ) {
      return item;
    }

    return (
      item.name ||
      item.title ||
      item.label ||
      "Không xác định"
    );
  };

  const getItemValue = (item) => {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      return null;
    }

    return (
      item.count ||
      item.value ||
      item.total ||
      null
    );
  };

  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        p-5
        hover:shadow-md
        transition-all duration-200
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`
            w-11 h-11
            rounded-xl
            flex items-center justify-center
            ${color}
          `}
        >
          <Icon size={20} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            {title}
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">
            Danh sách nổi bật
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className="
                flex items-center gap-3
                p-3
                rounded-xl
                hover:bg-slate-50
                transition-all
              "
            >
              {/* Rank */}
              <div
                className="
                  min-w-[30px]
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex items-center justify-center
                  text-xs font-semibold text-slate-600
                "
              >
                #{idx + 1}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {getItemLabel(item)}
                </p>

                {getItemValue(item) !== null && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {getItemValue(item)} lượt
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div
            className="
              py-10
              text-center
              text-sm
              text-slate-400
              bg-slate-50
              rounded-xl
            "
          >
            Không có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
};

const HotLists = ({
  hotKeywords,
  hotEvents,
  topLiked,
  topViewed,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <InfoListCard
        title="Từ khóa hot"
        icon={TrendingUp}
        items={hotKeywords}
        color="bg-blue-50 text-[#1E40AF]"
      />

      <InfoListCard
        title="Sự kiện hot"
        icon={Calendar}
        items={hotEvents}
        color="bg-amber-50 text-amber-600"
      />

      <InfoListCard
        title="Yêu thích nhiều"
        icon={Heart}
        items={topLiked}
        color="bg-pink-50 text-pink-600"
      />

      <InfoListCard
        title="Xem nhiều"
        icon={Eye}
        items={topViewed}
        color="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
};

export default HotLists;
