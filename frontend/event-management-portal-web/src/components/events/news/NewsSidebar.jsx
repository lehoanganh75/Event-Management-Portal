import React from "react";

import {
  Filter,
  X,
  Plus,
  Search,
  Info,
} from "lucide-react";

const NewsSidebar = ({
  t,
  isFilterExpanded,
  setIsFilterExpanded,
  eventSearch,
  setEventSearch,
  activeEventId,
  setActiveEventId,
  filteredEvents,
  posts,
  loading,
  events,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-24 shadow-sm">
        {/* Header */}
        <div
          onClick={() =>
            setIsFilterExpanded(
              !isFilterExpanded
            )
          }
          className="flex items-center justify-between cursor-pointer mb-5"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Filter
                size={17}
                className="text-[#1E40AF]"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {"Lọc theo sự kiện"}
              </h2>

              <p className="text-[11px] text-slate-400">
                {filteredEvents.length}{" "}
                {"Sự kiện"}
              </p>
            </div>
          </div>

          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all">
            {isFilterExpanded ? (
              <X size={16} />
            ) : (
              <Plus size={16} />
            )}
          </button>
        </div>

        {isFilterExpanded && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={eventSearch}
                onChange={(e) =>
                  setEventSearch(
                    e.target.value
                  )
                }
                placeholder={"Tìm sự kiện..."}
                className="
                  w-full
                  bg-slate-50
                  border border-slate-200
                  rounded-xl
                  pl-10 pr-3 py-2.5
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500/10
                  focus:border-[#1E40AF]
                  transition-all
                "
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {/* All */}
              <button
                onClick={() =>
                  setActiveEventId(
                    "all"
                  )
                }
                className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${activeEventId ===
                    "all"
                    ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {"Tất cả tin tức"}
                  </span>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${activeEventId ===
                        "all"
                        ? "bg-white/20"
                        : "bg-slate-100"
                      }`}
                  >
                    {posts.length}
                  </span>
                </div>
              </button>

              {/* Events */}
              {filteredEvents.map(
                (event) => (
                  <button
                    key={event.id}
                    onClick={() =>
                      setActiveEventId(
                        event.id
                      )
                    }
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${activeEventId ===
                        event.id
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <div className="line-clamp-1 text-sm font-medium">
                      {event.title}
                    </div>

                    <div
                      className={`text-[11px] mt-1 ${activeEventId ===
                          event.id
                          ? "text-blue-100"
                          : "text-slate-400"
                        }`}
                    >
                      {event.type ||
                        "Event"}
                    </div>
                  </button>
                )
              )}

              {/* Empty */}
              {filteredEvents.length ===
                0 &&
                eventSearch && (
                  <div className="py-8 text-center text-sm text-slate-400">
                    {"Không tìm thấy sự kiện nào khớp"}
                  </div>
                )}
            </div>

            {/* No events */}
            {events.length === 0 &&
              !loading && (
                <div className="mt-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <Info
                    size={20}
                    className="mx-auto text-slate-300 mb-2"
                  />

                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    {"Chưa có sự kiện nào có bài viết công khai."}
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsSidebar;
