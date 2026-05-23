import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Zap,
  Bell,
  Calendar,
  ChevronRight,
  History,
  TrendingUp,
  X
} from "lucide-react";

const EventsSidebar = ({
  onSearchChange,
  searchKeyword,
  t,
  user,
  navigate,
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
    const saved = localStorage.getItem("eventRecentSearches");
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
    localStorage.setItem("eventRecentSearches", JSON.stringify(newRecent));
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter(s => s !== term);
    setRecentSearches(newRecent);
    localStorage.setItem("eventRecentSearches", JSON.stringify(newRecent));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      saveRecentSearch(searchKeyword);
      setIsSearchFocused(false);
    }
  };

  const handleSelectSearch = (term) => {
    onSearchChange(term);
    saveRecentSearch(term);
    setIsSearchFocused(false);
  };
  const isStudentOrganizer =
    user && (user.role?.toUpperCase() === "STUDENT" || user.role?.toUpperCase() === "GUEST") &&
    ((user.ownedOrganizations && user.ownedOrganizations.length > 0) ||
     (user.eventRoles && user.eventRoles.length > 0));

  const handleNotificationsClick = () => {
    if (!user) {
      navigate("/login", { state: { from: "/notifications" } });
      return;
    }
    const role = user.role?.toUpperCase();
    if (role === "MEMBER" || isStudentOrganizer) {
      navigate("/student/notifications");
    } else if (role === "LECTURER") {
      navigate("/lecturer/notifications");
    } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
      navigate("/admin/notifications");
    } else {
      navigate("/notifications");
    }
  };

  const handleMyEventsClick = () => {
    if (!user) {
      navigate("/login", { state: { from: "/guest-events" } });
      return;
    }
    const role = user.role?.toUpperCase();
    if (role === "MEMBER" || isStudentOrganizer) {
      navigate("/student/events");
    } else if (role === "LECTURER") {
      navigate("/lecturer/events");
    } else if (role === "ADMIN" || role === "SUPER_ADMIN") {
      navigate("/admin/events");
    } else {
      navigate("/guest-events");
    }
  };

  const quickActions = [
    {
      label: "Thông báo mới",
      icon: Bell,
      onClick: handleNotificationsClick,
    },
    {
      label: "Sự kiện của tôi",
      icon: Calendar,
      onClick: handleMyEventsClick,
    },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-5">
      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
            <Search size={16} />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            {"Tìm theo tên sự kiện"}
          </h3>
        </div>

        <div className="relative" ref={searchRef}>
          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder={"Nhập tên sự kiện..."}
            value={searchKeyword}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            className="
              w-full
              h-11
              pl-10
              pr-4
              rounded-xl
              border border-slate-200
              bg-slate-50
              text-sm
              focus:outline-none
              focus:border-[#1E40AF]
              focus:bg-white
              transition-all
            "
          />

          {isSearchFocused && (
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
      </div>

      {/* Quick Access */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div
          className="
            flex items-center gap-2
            px-5 py-4
            border-b border-slate-100
          "
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
            <Zap size={16} />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            {"TRUY CẬP NHANH"}
          </h3>
        </div>

        <div className="p-2">
          {quickActions.map(
            (
              {
                label,
                icon: Icon,
                onClick,
              },
              index
            ) => (
              <button
                key={index}
                onClick={onClick}
                className="
                  w-full
                  flex items-center
                  justify-between
                  gap-3
                  px-3 py-3
                  rounded-xl
                  hover:bg-slate-50
                  transition-all
                  group
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-blue-50
                      text-[#1E40AF]
                      flex items-center justify-center
                      group-hover:bg-white
                      group-hover:shadow-sm
                      transition-all
                    "
                  >
                    <Icon size={18} />
                  </div>

                  <span
                    className="
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    {label}
                  </span>
                </div>

                <ChevronRight
                  size={16}
                  className="
                    text-slate-300
                    group-hover:text-[#1E40AF]
                    group-hover:translate-x-0.5
                    transition-all
                  "
                />
              </button>
            )
          )}
        </div>
      </div>
    </aside>
  );
};

export default EventsSidebar;
