import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Newspaper, Calendar, Clock, MapPin, Users, Loader2, Search, X, 
  ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, 
  Sparkles, Gift, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// IMPORT CÁC COMPONENT & API TẬP TRUNG
import Preloader from "./Preloader";
import LuckyWheelModal from "../luckyWheelModal/LuckyWheelModal";
import { eventApi } from "../../api/eventApi"; // SỬA: Dùng file gộp trung tâm

/* ─── CÁC COMPONENT PHỤ (Giữ nguyên logic UI) ─── */
function LeftSidebar({ onSearchChange, variant = "full" }) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  if (variant === "minimal") return null;
  return (
    <aside className="w-72 shrink-0 space-y-6 hidden lg:block">
      <div>
        <label className="text-base font-medium text-gray-700 mb-2 block">Tìm theo tên sự kiện</label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Nhập tên sự kiện..." value={keyword}
            onChange={(e) => { setKeyword(e.target.value); onSearchChange(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#245bb5] text-white px-4 py-3 font-semibold">⚡ TRUY CẬP NHANH</div>
        <div className="p-4 space-y-3">
          {[
            { icon: <Clock className="w-4 h-4" />, label: "Thông báo mới", link: "/notifications" },
            { icon: <Calendar className="w-4 h-4" />, label: "Sự kiện của tôi", link: "/my-events" },
          ].map((item, idx) => (
            <button key={idx} onClick={() => navigate(item.link)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition text-left cursor-pointer">
              {item.icon} {item.label}
            </button>
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
          type="text" placeholder="Tìm kiếm sự kiện..." value={keyword}
          onChange={(e) => { setKeyword(e.target.value); onSearchChange(e.target.value); }}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
    </div>
  );
}

function EventCard({ item, onClick }) {
  const availableSlots = (item.maxParticipants || 0) - (item.registeredCount || 0);
  const availabilityPercent = ((availableSlots) / (item.maxParticipants || 1)) * 100;

  return (
    <div onClick={() => onClick(item.id)} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.99]">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 md:w-56 shrink-0">
          <img
            src={item.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600"}
            alt={item.title} className="w-full h-44 sm:h-full object-cover"
            onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=Event+Image"; }}
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex gap-1.5 items-center mb-2.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${
              item.status === "PUBLISHED" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-green-50 text-green-700 border-green-100"
            }`}>
              {item.status === "PUBLISHED" ? "Sắp diễn ra" : item.status}
            </span>
            {availabilityPercent <= 20 && availabilityPercent > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">Sắp hết chỗ</span>}
          </div>
          <h3 className="font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2 uppercase">{item.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 font-medium">
            <div className="flex gap-1 items-center"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.location}</div>
            <div className="flex gap-1 items-center"><Users className="w-3.5 h-3.5 text-blue-500" /> {item.registeredCount}/{item.maxParticipants}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function EventFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLecturerView = location.pathname.startsWith("/lecturer");

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
  });
  
  const ITEMS_PER_PAGE = 5;

  const handleEventClick = (eventId) => navigate(`/events/${eventId}`);

  // FETCH DATA SỬ DỤNG API TẬP TRUNG
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        // SỬ DỤNG API GỘP: axiosClient tự lo Token và URL
        const res = await eventApi.events.getAll();
        const data = res.data || [];
        
        // Lọc bỏ bản nháp và chỉ lấy sự kiện công khai
        const visibleEvents = data.filter(ev => 
          ev.status !== "DRAFT" && ev.status !== "PLAN_PENDING_APPROVAL"
        );
        
        setPosts(visibleEvents);
      } catch (err) {
        console.error("Lỗi fetch sự kiện:", err);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [filters.status]);

  // LOGIC FILTER VÀ PHÂN TRANG
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesKeyword = post.title.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesStatus = filters.status === "all" || post.status === filters.status;
        return matchesKeyword && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt);
        if (sortBy === "most-registered") return (b.registeredCount || 0) - (a.registeredCount || 0);
        return 0;
      });
  }, [posts, searchKeyword, filters.status, sortBy]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div id="su-kien" className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {isLoading && <Preloader />}

      {!isLecturerView && <MobileSearchBar onSearchChange={setSearchKeyword} />}

      <div className="w-full px-4 sm:px-6 lg:px-12 flex gap-6 flex-1 py-4">
        {!isLecturerView && <LeftSidebar onSearchChange={setSearchKeyword} />}

        <main className="flex-1 min-w-0">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">SỰ KIỆN NỔI BẬT</h1>
              <p className="text-sm text-slate-400 font-medium">Khám phá các hoạt động bổ ích tại IUH</p>
            </div>
          </div>

          {/* Tool Bar */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="text-sm text-slate-500">Tìm thấy <span className="font-bold text-blue-600">{filteredPosts.length}</span> sự kiện</div>
            </div>
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="border-none bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="most-registered">Quan tâm nhất</option>
            </select>
          </div>

          {/* List Content */}
          <div className="space-y-4">
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map((item) => (
                <EventCard key={item.id} item={item} onClick={handleEventClick} />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">Không có sự kiện nào</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 mb-10">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-30 cursor-pointer transition-all"><ChevronLeft size={18} /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border text-slate-400 hover:border-blue-600 hover:text-blue-600"} cursor-pointer`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 border rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-30 cursor-pointer transition-all"><ChevronRight size={18} /></button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button onClick={() => setShowWheel(true)} className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-xl shadow-orange-200 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"><Gift size={24} /></button>
        <button onClick={() => setShowChat(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"><Sparkles size={24} /></button>
      </div>

      {/* Modals */}
      {showWheel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <button onClick={() => setShowWheel(false)} className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center z-10 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"><X size={20} /></button>
            <LuckyWheelModal onClose={() => setShowWheel(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventFeed;