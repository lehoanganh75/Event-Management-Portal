import React, { useEffect, useState } from "react";
import {
  Filter,
  Newspaper,
  FileText,
  Clock,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  QrCode,
  Gift,
  BarChart3,
  Bot,
  Bell,
  Search,
  Sparkles,
  X,
  Star,
  CheckCircle,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import Preloader from "./Preloader";
import LuckyWheelModal from "../luckyWheelModal/LuckyWheelModal";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllEvents } from "../../api/eventApi";

/* ─── LEFT SIDEBAR (desktop only) ─── */
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
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#245bb5] text-white px-4 py-3 font-semibold">
          ⚡ TRUY CẬP NHANH
        </div>
        <div className="p-4 space-y-3">
          {[
            {
              icon: <Bell className="w-4 h-4" />,
              label: "Thông báo mới",
              link: "/notifications",
            },
            {
              icon: <Calendar className="w-4 h-4" />,
              label: "Sự kiện sắp diễn ra",
              link: "/?filter=upcoming",
            },
            {
              icon: <CheckCircle className="w-4 h-4" />,
              label: "Điểm danh hôm nay",
              link: "/attendance?today=true",
            },
            {
              icon: <FileText className="w-4 h-4" />,
              label: "Sự kiện đã tham gia",
              link: "/?tab=joined",
            },
            {
              icon: <Star className="w-4 h-4" />,
              label: "Sự kiện nổi bật",
              link: "/?filter=featured",
            },
          ].map((item, idx) => (
            <a key={idx} href={item.link} className="block">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition">
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
    if (isOpen) {
      setLocalFilters(filters);
    }
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

  const selectClass =
    "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelClass = "text-sm font-semibold text-gray-700 block mb-1.5";

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center bg-black/50">
      {/* Sheet on mobile, centered modal on sm+ */}
      <div className="bg-white w-full sm:rounded-xl sm:shadow-2xl sm:w-full sm:max-w-4xl max-h-[92dvh] sm:max-h-[90vh] overflow-hidden rounded-t-2xl shadow-2xl flex flex-col sm:mx-4">
        {/* Header */}
        <div className="bg-blue-700 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5" />
            <h2 className="text-lg font-bold">Bộ lọc nâng cao</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Mobile: 1 col, sm: 2 cols, lg: 3 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Trạng thái */}
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                value={localFilters.status}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, status: e.target.value })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
              </select>
            </div>

            {/* Loại sự kiện */}
            <div>
              <label className={labelClass}>Loại sự kiện</label>
              <select
                value={localFilters.type}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, type: e.target.value })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="seminar">Hội thảo</option>
                <option value="sport">Thi đấu thể thao</option>
                <option value="culture">Văn nghệ</option>
                <option value="career">Tuyển dụng</option>
                <option value="workshop">Workshop</option>
                <option value="charity">Từ thiện</option>
                <option value="networking">Giao lưu</option>
              </select>
            </div>

            {/* Đơn vị tổ chức */}
            <div>
              <label className={labelClass}>Đơn vị tổ chức</label>
              <select
                value={localFilters.organizer}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    organizer: e.target.value,
                  })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="ctsv">Phòng CTSV</option>
                <option value="cntt">Khoa CNTT</option>
                <option value="kinh-te">Khoa Kinh tế</option>
                <option value="doan-hoi">Đoàn - Hội</option>
                <option value="club">CLB sinh viên</option>
              </select>
            </div>

            {/* Địa điểm */}
            <div>
              <label className={labelClass}>Địa điểm</label>
              <select
                value={localFilters.location}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, location: e.target.value })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="hoi-truong-a">Hội trường A</option>
                <option value="hoi-truong-b">Hội trường B</option>
                <option value="san-van-dong">Sân vận động</option>
                <option value="online">Online</option>
                <option value="ngoai-truong">Ngoài trường</option>
              </select>
            </div>

            {/* Tình trạng chỗ */}
            <div>
              <label className={labelClass}>Tình trạng chỗ</label>
              <select
                value={localFilters.availability}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    availability: e.target.value,
                  })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="available">Còn chỗ (&gt; 20%)</option>
                <option value="limited">Sắp hết chỗ (&lt; 20%)</option>
                <option value="full">Đã đầy</option>
              </select>
            </div>

            {/* Điểm rèn luyện */}
            <div>
              <label className={labelClass}>Điểm rèn luyện</label>
              <select
                value={localFilters.hasPoints}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    hasPoints: e.target.value,
                  })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="yes">Có điểm rèn luyện</option>
                <option value="no">Không có</option>
              </select>
            </div>

            {/* Phí tham gia */}
            <div>
              <label className={labelClass}>Phí tham gia</label>
              <select
                value={localFilters.fee}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, fee: e.target.value })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </select>
            </div>

            {/* Thời lượng */}
            <div>
              <label className={labelClass}>Thời lượng</label>
              <select
                value={localFilters.duration}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, duration: e.target.value })
                }
                className={selectClass}
              >
                <option value="all">Tất cả</option>
                <option value="under-2h">Dưới 2 giờ</option>
                <option value="2-4h">2-4 giờ</option>
                <option value="half-day">Nửa ngày</option>
                <option value="full-day">Cả ngày</option>
                <option value="multi-day">Nhiều ngày</option>
              </select>
            </div>

            {/* Đối tượng */}
            <div>
              <label className={labelClass}>Đối tượng</label>
              <select
                value={localFilters.target}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, target: e.target.value })
                }
                className={selectClass}
              >
                <option value="all">Tất cả sinh viên</option>
                <option value="year-1">Sinh viên năm 1</option>
                <option value="year-2-3">Sinh viên năm 2-3</option>
                <option value="year-4">Sinh viên năm 4</option>
                <option value="cntt-only">Chỉ khoa CNTT</option>
              </select>
            </div>

            {/* Khoảng thời gian - spans full width on mobile */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass}>Khoảng thời gian</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateFrom: e.target.value,
                    })
                  }
                  className={selectClass}
                />
                <input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, dateTo: e.target.value })
                  }
                  className={selectClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 bg-gray-50 flex justify-between items-center shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Đặt lại
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium"
            >
              Áp dụng
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

  return (
    <div
      onClick={() => onClick(item.id)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.99]"
    >
      {/* Mobile: stacked layout, md+: side-by-side */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 md:w-56 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-44 sm:h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Badges row */}
          <div className="flex gap-1.5 items-center mb-2.5 flex-wrap">
            <div className="flex gap-1 items-center text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{item.eventDate}</span>
            </div>

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                item.status === "upcoming"
                  ? "bg-blue-100 text-blue-700"
                  : item.status === "ongoing"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.status === "upcoming"
                ? "Sắp diễn ra"
                : item.status === "ongoing"
                  ? "Đang diễn ra"
                  : "Đã kết thúc"}
            </span>

            {item.hasPoints && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                Có điểm RL
              </span>
            )}

            {availabilityPercent > 20 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                Còn chỗ
              </span>
            )}
            {availabilityPercent > 0 && availabilityPercent <= 20 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                Sắp hết chỗ
              </span>
            )}
            {availabilityPercent === 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                Đã đầy
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 mb-1.5 leading-snug hover:text-blue-600 line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {item.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <div className="flex gap-1 items-center">
              <Clock className="w-3.5 h-3.5" />
              <span>{item.eventTime}</span>
            </div>
            <div className="flex gap-1 items-center">
              <Users className="w-3.5 h-3.5" />
              <span>
                {item.registeredCount.toLocaleString()} /{" "}
                {item.maxParticipants.toLocaleString()}
              </span>
            </div>
            {item.tags && (
              <div className="flex gap-1">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="text-blue-500 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
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
  const [showWheel, setShowWheel] = useState(false);
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

  useEffect(() => {
    getAllEvents()
      .then((res) => setPosts(res.data))
      .catch((err) => {
        console.error("Lỗi tải sự kiện:", err);
        setPosts([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchKeyword, filters, sortBy]);

  // useEffect(() => {
  //   const timer = setTimeout(() => setIsLoading(false), 1000);
  //   return () => clearTimeout(timer);
  // }, []);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "all" && v !== "",
  ).length;

  const filteredPosts = posts
    .filter((post) => {
      const matchesKeyword = post.title
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      const matchesStatus =
        filters.status === "all" || post.status === filters.status;
      const matchesType = filters.type === "all" || post.type === filters.type;
      const matchesOrganizer =
        filters.organizer === "all" || post.organizer === filters.organizer;
      const matchesLocation =
        filters.location === "all" ||
        (filters.location === "online" && post.eventMode === "Online") ||
        (filters.location !== "online" && post.eventMode === "Offline");
      const availabilityPercent =
        ((post.maxParticipants - post.registeredCount) / post.maxParticipants) *
        100;
      const matchesAvailability =
        filters.availability === "all" ||
        (filters.availability === "available" && availabilityPercent > 20) ||
        (filters.availability === "limited" &&
          availabilityPercent > 0 &&
          availabilityPercent <= 20) ||
        (filters.availability === "full" && availabilityPercent === 0);
      const matchesPoints =
        filters.hasPoints === "all" ||
        (filters.hasPoints === "yes" && post.hasPoints) ||
        (filters.hasPoints === "no" && !post.hasPoints);
      const matchesFee = filters.fee === "all" || post.fee === filters.fee;
      const matchesDuration =
        filters.duration === "all" || post.duration === filters.duration;
      const matchesTarget =
        filters.target === "all" || post.target === filters.target;
      return (
        matchesKeyword &&
        matchesStatus &&
        matchesType &&
        matchesOrganizer &&
        matchesLocation &&
        matchesAvailability &&
        matchesPoints &&
        matchesFee &&
        matchesDuration &&
        matchesTarget
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return String(b.id).localeCompare(String(a.id));
        case "oldest":
          return String(a.id).localeCompare(String(b.id));
        case "most-registered":
          return b.registeredCount - a.registeredCount;
        case "most-available":
          return (
            b.maxParticipants -
            b.registeredCount -
            (a.maxParticipants - a.registeredCount)
          );
        default:
          return 0;
      }
    });
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isLoading && !isLecturerView && <Preloader />}

      {/* Mobile search bar */}
      {!isLecturerView && <MobileSearchBar onSearchChange={setSearchKeyword} />}

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 flex gap-6 flex-1 py-4">
        {/* Desktop Sidebar */}
        {!isLecturerView && <LeftSidebar onSearchChange={setSearchKeyword} />}

        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-700">
                SỰ KIỆN
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Cập nhật thông tin sự kiện mới nhất tại IUH
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 flex justify-between items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 font-medium relative shrink-0 text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                Tìm thấy{" "}
                <span className="font-bold text-gray-700">
                  {filteredPosts.length}
                </span>{" "}
                sự kiện
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white max-w-35 sm:max-w-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="most-registered">Nhiều đăng ký</option>
                <option value="most-available">Còn nhiều chỗ</option>
              </select>
            </div>
          </div>

          {/* Event list */}
          <div className="space-y-3 sm:space-y-4">
            {filteredPosts.length > 0 ? (
              paginatedPosts.map((item) => (
                <EventCard
                  key={item.id}
                  item={item}
                  onClick={handleEventClick}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl border p-12 text-center">
                <Search className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  Không tìm thấy sự kiện nào phù hợp
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredPosts.length > 0 && (
            <div className="flex justify-center gap-1.5 mt-8 mb-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 sm:w-10 sm:h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-blue-700 text-white"
                      : "border hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-9 h-9 sm:w-10 sm:h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Float buttons */}
      {!isLecturerView && (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-50">
          <button
            onClick={() => setShowChat(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-tr from-purple-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label="AI Chat"
          >
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
          <button
            onClick={() => setShowWheel(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label="Lucky Wheel"
          >
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && !isLecturerView && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-end justify-end bg-black/30">
          <div
            className="w-full sm:w-88 sm:max-w-sm bg-white sm:rounded-2xl shadow-2xl sm:m-6 overflow-hidden flex flex-col rounded-t-2xl"
            style={{ height: "min(520px, 85dvh)" }}
          >
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <span className="font-bold">AI Assistant</span>
              <button
                onClick={() => setShowChat(false)}
                className="hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-gray-600 text-sm">
                Xin chào! Tôi là AI Assistant của IUH. Tôi có thể giúp bạn tìm
                kiếm sự kiện phù hợp!
              </p>
            </div>
            <div className="p-3 border-t flex gap-2 shrink-0">
              <input
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                placeholder="Nhập câu hỏi..."
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 shrink-0 text-sm">
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lucky Wheel Modal */}
      {showWheel && !isLecturerView && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-md bg-transparent">
            <button
              onClick={() => setShowWheel(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center z-10 hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <LuckyWheelModal onClose={() => setShowWheel(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventFeed;
