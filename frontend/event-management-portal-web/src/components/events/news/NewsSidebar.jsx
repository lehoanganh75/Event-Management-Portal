import React, { useState, useEffect, useRef } from "react";

import {
  Filter,
  X,
  Plus,
  Search,
  Info,
  History,
  TrendingUp,
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  // Mock hot searches
  const hotSearches = [
    { keyword: "Mùa hè xanh", count: 1250 },
    { keyword: "Hội thảo AI", count: 856 },
    { keyword: "Kỹ năng mềm", count: 543 },
    { keyword: "Ngày hội việc làm", count: 320 },
    { keyword: "Giao lưu doanh nghiệp", count: 215 },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("newsRecentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) { }
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    let newRecent = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("newsRecentSearches", JSON.stringify(newRecent));
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter(s => s !== term);
    setRecentSearches(newRecent);
    localStorage.setItem("newsRecentSearches", JSON.stringify(newRecent));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      saveRecentSearch(eventSearch);
      setIsSearchFocused(false);
    }
  };

  const handleSelectSearch = (term) => {
    setEventSearch(term);
    saveRecentSearch(term);
    setIsSearchFocused(false);
  };

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
            <div className="relative mb-4" ref={searchRef}>
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
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
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

              {isSearchFocused && (recentSearches.length > 0 || hotSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-3 z-50 overflow-hidden">
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Tìm kiếm gần đây</h4>
                      <ul className="space-y-1">
                        {recentSearches.map((term, idx) => (
                          <li key={idx} className="flex items-center justify-between group rounded-lg hover:bg-slate-50 cursor-pointer px-2 py-1.5 transition-colors" onClick={() => handleSelectSearch(term)}>
                            <div className="flex items-center gap-2 text-slate-600">
                              <History size={14} className="text-slate-400" />
                              <span className="text-sm line-clamp-1">{term}</span>
                            </div>
                            <button onClick={(e) => removeRecentSearch(e, term)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1"><TrendingUp size={14} className="text-orange-500" /> Tìm kiếm phổ biến</h4>
                    <ul className="space-y-1">
                      {hotSearches.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between rounded-lg hover:bg-slate-50 cursor-pointer px-2 py-1.5 transition-colors" onClick={() => handleSelectSearch(item.keyword)}>
                          <div className="flex items-center gap-2">
                            <span className={`w-4 text-center text-xs font-bold ${idx < 3 ? 'text-orange-500' : 'text-slate-300'}`}>{idx + 1}</span>
                            <span className="text-sm text-slate-700 line-clamp-1">{item.keyword}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1">
                            {item.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
