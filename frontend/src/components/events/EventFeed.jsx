import React, { useEffect, useState, useMemo } from "react";
import {
  Newspaper,
  FileText,
  Clock,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  X,
  Star,
  CheckCircle,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import Preloader from "./Preloader";
import { useNavigate, useLocation } from "react-router-dom";
import { getEventsByStatuses } from "../../api/eventApi";

/* ─── LEFT SIDEBAR ─── */
function LeftSidebar({ onSearchChange, variant = "full" }) {
  const [keyword, setKeyword] = useState("");

  if (variant === "minimal") return null;

  return (
    <aside className="w-72 shrink-0 space-y-6 hidden lg:block">
      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">
          Tìm theo tên sự kiện
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập tên sự kiện..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-[#245bb5] text-white px-4 py-3 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> TRUY CẬP NHANH
        </div>
        <div className="p-4 space-y-3">
          {[
            { icon: <Bell className="w-4 h-4" />, label: "Thông báo mới", link: "/notifications" },
            { icon: <Calendar className="w-4 h-4" />, label: "Sự kiện sắp diễn ra", link: "/?filter=upcoming" },
            { icon: <CheckCircle className="w-4 h-4" />, label: "Điểm danh hôm nay", link: "/attendance?today=true" },
            { icon: <FileText className="w-4 h-4" />, label: "Sự kiện đã tham gia", link: "/?tab=joined" },
            { icon: <Star className="w-4 h-4" />, label: "Sự kiện nổi bật", link: "/?filter=featured" },
          ].map((item, idx) => (
            <a key={idx} href={item.link} className="block group">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors font-medium">
                {item.icon}
                {item.label}
              </button>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─── MOBILE SEARCH ─── */
function MobileSearchBar({ onSearchChange }) {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="lg:hidden px-4 pt-4 pb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            onSearchChange(e.target.value);
          }}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
    </div>
  );
}

/* ─── FILTER MODAL ─── */
function FilterModal({ isOpen, onClose, filters, setFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: "all",
      type: "all",
      organizer: "all",
      location: "all",
      availability: "all",
      hasPoints: "all",
      fee: "all",
      duration: "all",
      target: "all",
      dateFrom: "",
      dateTo: "",
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
  };

  if (!isOpen) return null;

  const selectClass = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelClass = "text-sm font-semibold text-gray-700 block mb-1.5";

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-4xl max-h-[92dvh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="bg-blue-700 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5" />
            <h2 className="text-lg font-bold">Bộ lọc nâng cao</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Điểm rèn luyện</label>
              <select
                value={localFilters.hasPoints}
                onChange={(e) => setLocalFilters({ ...localFilters, hasPoints: e.target.value })}
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="yes">Có điểm rèn luyện</option>
                <option value="no">Không có</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Địa điểm</label>
              <select
                value={localFilters.location}
                onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button onClick={handleReset} className="text-sm text-red-600 hover:text-red-800 font-bold transition-colors">
            XÓA TẤT CẢ
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 font-medium">
              Hủy
            </button>
            <button onClick={handleApply} className="px-6 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-bold shadow-md shadow-blue-200">
              ÁP DỤNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EVENT CARD ─── */
function EventCard({ item, onClick }) {
  const availableSlots = item.maxParticipants - item.registeredCount;
  const availabilityPercent = (availableSlots / item.maxParticipants) * 100;

  // Sync with Backend Enum: PUBLISHED, ONGOING, COMPLETED
  const getStatusDisplay = (status) => {
    const s = status?.toUpperCase();
    if (s === "PUBLISHED") return { label: "Sắp diễn ra", css: "bg-blue-100 text-blue-700" };
    if (s === "ONGOING") return { label: "Đang diễn ra", css: "bg-green-100 text-green-700 border-green-200" };
    if (s === "COMPLETED") return { label: "Đã kết thúc", css: "bg-gray-100 text-gray-600" };
    return { label: status, css: "bg-gray-100 text-gray-600" };
  };

  const statusInfo = getStatusDisplay(item.status);

  return (
    <div
      onClick={() => onClick(item.id)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.98] group"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 md:w-56 shrink-0 overflow-hidden relative">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000"}
            alt={item.title}
            className="w-full h-44 sm:h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
             <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold shadow-sm ${statusInfo.css}`}>
                {statusInfo.label}
             </span>
          </div>
        </div>

        <div className="flex-1 p-5">
          <div className="flex gap-2 items-center mb-3 flex-wrap">
            <div className="flex gap-1 items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{item.eventDate}</span>
            </div>

            {item.hasPoints && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-100 text-purple-700 uppercase">
                + Điểm rèn luyện
              </span>
            )}

            {availabilityPercent <= 20 && availabilityPercent > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-100 text-orange-700 uppercase">
                Sắp hết chỗ
              </span>
            )}
            {availabilityPercent <= 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-100 text-red-700 uppercase">
                Đã đầy
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {item.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-50">
            <div className="flex gap-1.5 items-center">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{item.eventTime}</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-gray-700">
                {item.registeredCount} / {item.maxParticipants}
              </span>
            </div>
            {item.eventTopic && (
              <span className="ml-auto text-blue-600 font-bold">#{item.eventTopic}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function EventFeed() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    organizer: "all",
    location: "all",
    availability: "all",
    hasPoints: "all",
    fee: "all",
    duration: "all",
    target: "all",
    dateFrom: "",
    dateTo: "",
  });

  const ITEMS_PER_PAGE = 5;
  const navigate = useNavigate();
  const location = useLocation();
  const isLecturerView = location.pathname.startsWith("/lecturer");

  const handleEventClick = (eventId) => navigate(`/events/${eventId}`);

  // 1. Fetch data from Backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Call batch API for public statuses
        const res = await getEventsByStatuses(["PUBLISHED", "ONGOING", "COMPLETED"]);
        console.log(res.data);
        setPosts(res.data);
      } catch (err) {
        console.error("Lỗi tải sự kiện:", err);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Local Filtering Logic
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesKeyword = post.title.toLowerCase().includes(searchKeyword.toLowerCase());
        
        // Sync with UI status filter
        const matchesStatus = filters.status === "all" || 
          (filters.status === "upcoming" && post.status?.toUpperCase() === "PUBLISHED") ||
          (filters.status === "ongoing" && post.status?.toUpperCase() === "ONGOING") ||
          (filters.status === "completed" && post.status?.toUpperCase() === "COMPLETED");

        const matchesLocation = filters.location === "all" || 
           (filters.location === "online" && post.eventMode?.toUpperCase() === "ONLINE") ||
           (filters.location === "offline" && post.eventMode?.toUpperCase() === "OFFLINE");

        const matchesPoints = filters.hasPoints === "all" ||
          (filters.hasPoints === "yes" && post.hasPoints) ||
          (filters.hasPoints === "no" && !post.hasPoints);

        return matchesKeyword && matchesStatus && matchesLocation && matchesPoints;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.id.localeCompare(a.id);
        if (sortBy === "oldest") return a.id.localeCompare(b.id);
        if (sortBy === "most-registered") return b.registeredCount - a.registeredCount;
        return 0;
      });
  }, [posts, searchKeyword, filters, sortBy]);

  // 3. Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filters, sortBy]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const activeFilterCount = Object.values(filters).filter(v => v !== "all" && v !== "").length;

  return (
    <div id="su-kien" className="min-h-screen bg-gray-50 flex flex-col">
      {isLoading && !isLecturerView && <Preloader />}

      {!isLecturerView && <MobileSearchBar onSearchChange={setSearchKeyword} />}

      <div className="w-full px-4 sm:px-6 lg:px-12 flex gap-8 flex-1 py-6">
        {!isLecturerView && <LeftSidebar onSearchChange={setSearchKeyword} />}

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                SỰ KIỆN <span className="text-blue-600">IUH</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Khám phá và tham gia các hoạt động sinh viên mới nhất
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-6 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-bold text-sm relative"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="text-sm font-medium text-gray-400 hidden sm:block">
                Tìm thấy <span className="text-gray-900">{filteredPosts.length}</span> sự kiện
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="most-registered">Hot nhất</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              paginatedPosts.map((item) => (
                <EventCard key={item.id} item={item} onClick={handleEventClick} />
              ))
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-900 font-bold text-lg">Không tìm thấy kết quả</p>
                <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>

          {filteredPosts.length > 0 && (
            <div className="flex justify-center gap-2 mt-10 mb-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-white hover:border-blue-500 hover:text-blue-500 transition-all disabled:opacity-30 shadow-sm"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    currentPage === i + 1 ? "bg-blue-600 text-white shadow-blue-200" : "bg-white border text-gray-600 hover:border-blue-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-white hover:border-blue-500 hover:text-blue-500 transition-all disabled:opacity-30 shadow-sm"
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {!isLecturerView && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <button
            onClick={() => setShowChat(true)}
            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 hover:scale-110 active:scale-95 transition-all group"
          >
            <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-end justify-end bg-black/20 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-10">
            <div className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold">IUH Assistant</span>
              </div>
              <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-96 p-5 overflow-y-auto bg-gray-50">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%] mb-4">
                 <p className="text-gray-700 text-sm leading-relaxed">
                   Chào bạn! Tôi có thể giúp gì cho bạn trong việc tìm kiếm các sự kiện tại IUH?
                 </p>
              </div>
            </div>
            <div className="p-4 border-t bg-white flex gap-2 shrink-0">
              <input className="flex-1 border-none bg-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Hỏi tôi bất cứ điều gì..." />
              <button className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 shadow-lg shadow-blue-100">➤</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventFeed;