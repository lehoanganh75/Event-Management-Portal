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
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import Preloader from "./Preloader";
import LuckyWheelModal from "../luckyWheelModal/LuckyWheelModal";

const mockPosts = [
  {
    id: 1,
    title: "Hội thảo Khoa học: AI và Machine Learning trong Công nghiệp 4.0",
    description:
      "Hội thảo về ứng dụng AI và ML trong các ngành công nghiệp hiện đại",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    eventDate: "15/12/2025",
    eventTime: "08:00 - 11:30",
    registeredCount: 450,
    maxParticipants: 500,
    status: "upcoming",
    type: "workshop",
    organizer: "cntt",
    location: "hoi-truong-a",
    hasPoints: true,
    fee: "free",
    duration: "2-4h",
    target: "all",
    tags: ["AI", "MachineLearning"],
  },
  {
    id: 2,
    title: "Ngày Hội Việc Làm IUH Career Fair 2025",
    description: "Sự kiện kết nối sinh viên với các doanh nghiệp hàng đầu",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    eventDate: "20/12/2025",
    eventTime: "07:30 - 16:30",
    registeredCount: 1850,
    maxParticipants: 2000,
    status: "ongoing",
    type: "career",
    organizer: "ctsv",
    location: "san-van-dong",
    hasPoints: true,
    fee: "free",
    duration: "full-day",
    target: "all",
    tags: ["TìmViệc", "CareerFair"],
  },
  {
    id: 3,
    title: "Workshop: Kỹ năng phỏng vấn cho sinh viên",
    description: "Hướng dẫn cách chuẩn bị và vượt qua phỏng vấn xin việc",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    eventDate: "01/12/2025",
    eventTime: "14:00 - 17:00",
    registeredCount: 200,
    maxParticipants: 200,
    status: "completed",
    type: "workshop",
    organizer: "ctsv",
    location: "online",
    hasPoints: true,
    fee: "free",
    duration: "2-4h",
    target: "year-4",
    tags: ["KỹNăngMềm"],
  },
];

function LeftSidebar({ onSearchChange }) {
  const [keyword, setKeyword] = useState("");

  return (
    <aside className="w-72 shrink-0 space-y-6 hidden lg:block">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Tìm theo tên sự kiện
        </label>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập tên sự kiện..."
            value={keyword}
            onChange={(e) => {
              const value = e.target.value;
              setKeyword(value);
              onSearchChange(value);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-700 text-white px-4 py-3 font-semibold">
          ⚡ TRUY CẬP NHANH
        </div>
        <div className="p-3 space-y-2">
          {[
            {
              icon: <Bell className="w-4 h-4" />,
              label: "Thông báo",
              link: "/notifications",
            },
            {
              icon: <Users className="w-4 h-4" />,
              label: "Điểm danh",
              link: "/attendance",
            },
            {
              icon: <FileText className="w-4 h-4" />,
              label: "Tổng kết",
              link: "/?tab=recaps",
            },
          ].map((item, idx) => (
            <a key={idx} href={item.link} className="block">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded">
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

function FilterModal({ isOpen, onClose, filters, setFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

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

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6" />
            <h2 className="text-xl font-bold">Bộ lọc nâng cao</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Grid 3 cột */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-3 gap-6">
            {/* Cột 1 */}
            <div className="space-y-5">
              {/* Trạng thái */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Trạng thái
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, status: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã kết thúc</option>
                </select>
              </div>

              {/* Loại sự kiện */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Loại sự kiện
                </label>
                <select
                  value={localFilters.type}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, type: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Đơn vị tổ chức
                </label>
                <select
                  value={localFilters.organizer}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      organizer: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="ctsv">Phòng CTSV</option>
                  <option value="cntt">Khoa CNTT</option>
                  <option value="kinh-te">Khoa Kinh tế</option>
                  <option value="doan-hoi">Đoàn - Hội</option>
                  <option value="club">CLB sinh viên</option>
                </select>
              </div>

              {/* Khoảng thời gian */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Khoảng thời gian
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateFrom: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        dateTo: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-5">
              {/* Địa điểm */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Địa điểm
                </label>
                <select
                  value={localFilters.location}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      location: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Tình trạng chỗ
                </label>
                <select
                  value={localFilters.availability}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      availability: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="available">Còn chỗ (&gt; 20%)</option>
                  <option value="limited">Sắp hết chỗ (&lt; 20%)</option>
                  <option value="full">Đã đầy</option>
                </select>
              </div>

              {/* Điểm rèn luyện */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Điểm rèn luyện
                </label>
                <select
                  value={localFilters.hasPoints}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      hasPoints: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="yes">Có điểm rèn luyện</option>
                  <option value="no">Không có</option>
                </select>
              </div>

              {/* Phí tham gia */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Phí tham gia
                </label>
                <select
                  value={localFilters.fee}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, fee: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="free">Miễn phí</option>
                  <option value="paid">Có phí</option>
                </select>
              </div>
            </div>

            {/* Cột 3 */}
            <div className="space-y-5">
              {/* Thời lượng */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Thời lượng
                </label>
                <select
                  value={localFilters.duration}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      duration: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Đối tượng
                </label>
                <select
                  value={localFilters.target}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, target: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả sinh viên</option>
                  <option value="year-1">Sinh viên năm 1</option>
                  <option value="year-2-3">Sinh viên năm 2-3</option>
                  <option value="year-4">Sinh viên năm 4</option>
                  <option value="cntt-only">Chỉ khoa CNTT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center">
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

export function EventFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilterModal, setShowFilterModal] = useState(false);
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

  const totalPages = 3;
  const [showChat, setShowChat] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Đếm số filter đang active
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "all" && v !== ""
  ).length;

  // Logic lọc phức tạp
  const filteredPosts = mockPosts
    .filter((post) => {
      // Tìm kiếm theo keyword
      const matchesKeyword = post.title
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());

      // Lọc theo trạng thái
      const matchesStatus =
        filters.status === "all" || post.status === filters.status;

      // Lọc theo loại
      const matchesType = filters.type === "all" || post.type === filters.type;

      // Lọc theo đơn vị tổ chức
      const matchesOrganizer =
        filters.organizer === "all" || post.organizer === filters.organizer;

      // Lọc theo địa điểm
      const matchesLocation =
        filters.location === "all" || post.location === filters.location;

      // Lọc theo tình trạng chỗ
      const availabilityPercent =
        ((post.maxParticipants - post.registeredCount) /
          post.maxParticipants) *
        100;
      const matchesAvailability =
        filters.availability === "all" ||
        (filters.availability === "available" && availabilityPercent > 20) ||
        (filters.availability === "limited" &&
          availabilityPercent > 0 &&
          availabilityPercent <= 20) ||
        (filters.availability === "full" && availabilityPercent === 0);

      // Lọc theo điểm rèn luyện
      const matchesPoints =
        filters.hasPoints === "all" ||
        (filters.hasPoints === "yes" && post.hasPoints) ||
        (filters.hasPoints === "no" && !post.hasPoints);

      // Lọc theo phí
      const matchesFee = filters.fee === "all" || post.fee === filters.fee;

      // Lọc theo thời lượng
      const matchesDuration =
        filters.duration === "all" || post.duration === filters.duration;

      // Lọc theo đối tượng
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
      // Sắp xếp
      switch (sortBy) {
        case "newest":
          return b.id - a.id;
        case "oldest":
          return a.id - b.id;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isLoading && <Preloader />}

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-1 pb-12">
        <LeftSidebar onSearchChange={setSearchKeyword} />

        <main className="flex-1">
          <div
            id="su-kien"
            className="bg-white rounded-lg border p-6 mb-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-700">SỰ KIỆN</h1>
              <p className="text-gray-600">
                Cập nhật thông tin sự kiện mới nhất tại IUH
              </p>
            </div>
          </div>

          {/* Thanh công cụ: Bộ lọc + Sắp xếp */}
          <div className="bg-white rounded-lg border p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 font-medium relative"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="text-sm text-gray-600">
                Tìm thấy <span className="font-bold">{filteredPosts.length}</span> sự kiện
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="most-registered">Nhiều người đăng ký nhất</option>
                <option value="most-available">Còn nhiều chỗ nhất</option>
              </select>
            </div>
          </div>

          {/* Danh sách sự kiện */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((item) => {
                const availableSlots = item.maxParticipants - item.registeredCount;
                const availabilityPercent = (availableSlots / item.maxParticipants) * 100;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border p-4 flex gap-4 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-48 h-32 object-cover rounded"
                    />

                    <div className="flex-1">
                      <div className="flex gap-2 items-center mb-2 flex-wrap">
                        <div className="flex gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" /> {item.eventDate}
                        </div>

                        {/* Badges */}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.status === "upcoming"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "ongoing"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.status === "upcoming"
                            ? "Sắp diễn ra"
                            : item.status === "ongoing"
                              ? "Đang diễn ra"
                              : "Đã kết thúc"}
                        </span>

                        {item.hasPoints && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            Có điểm RL
                          </span>
                        )}

                        {availabilityPercent > 20 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Còn chỗ
                          </span>
                        )}
                        {availabilityPercent > 0 && availabilityPercent <= 20 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                            Sắp hết chỗ
                          </span>
                        )}
                        {availabilityPercent === 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                            Đã đầy
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold mb-2 hover:text-blue-600 cursor-pointer">
                        {item.title}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                      </p>

                      <div className="flex gap-4 mt-3 text-sm text-gray-600 flex-wrap">
                        <div className="flex gap-1 items-center">
                          <Clock className="w-4 h-4" /> {item.eventTime}
                        </div>
                        <div>
                          {item.registeredCount} / {item.maxParticipants} người
                        </div>
                        {item.tags && (
                          <div className="flex gap-1">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs text-blue-600"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg border p-12 text-center">
                <div className="text-gray-400 mb-2">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">
                  Không tìm thấy sự kiện nào phù hợp
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {filteredPosts.length > 0 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-50"
              >
                <ChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-700 text-white"
                      : "border hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-10 h-10 border rounded flex items-center justify-center hover:bg-gray-50"
              >
                <ChevronRight />
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

      {/* FLOAT BUTTONS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <div className="cursor-pointer" onClick={() => setShowChat(true)}>
          <div className="w-14 h-14 bg-linear-to-tr from-purple-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="cursor-pointer" onClick={() => setShowWheel(true)}>
          <div className="w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Gift className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* CHAT MODAL */}
      {showChat && (
        <div className="fixed inset-0 z-100 flex items-end justify-end bg-black/30">
          <div className="w-90 h-130 bg-white rounded-2xl shadow-2xl m-6 overflow-hidden relative">
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-4 py-3 flex justify-between items-center">
              <span className="font-bold">AI Assistant</span>
              <button
                onClick={() => setShowChat(false)}
                className="text-xl hover:bg-white/20 w-8 h-8 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="p-4 h-100 overflow-y-auto">
              <p className="text-gray-600">
                Xin chào! Tôi là AI Assistant của IUH…
              </p>
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập câu hỏi..."
              />
              <button className="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LUCKY WHEEL MODAL */}
      {showWheel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40">
          <div className="relative w-125 max-w-full bg-transparent">
            <button
              onClick={() => setShowWheel(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-xl z-10 hover:bg-gray-100"
            >
              ✕
            </button>
            <LuckyWheelModal onClose={() => setShowWheel(false)} />
          </div>
        </div>
      )}
    </div>
  );
}