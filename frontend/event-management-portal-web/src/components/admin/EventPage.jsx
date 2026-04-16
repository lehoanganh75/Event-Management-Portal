import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Eye, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, Plus,
  Calendar, Clock, Users, PlayCircle, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";

/* ================= CONFIG ================= */
const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PLAN_PENDING_APPROVAL: "Chờ duyệt kế hoạch",
  PLAN_APPROVED: "Đã duyệt kế hoạch",
  EVENT_PENDING_APPROVAL: "Chờ duyệt sự kiện",
  PUBLISHED: "Đã công bố",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
};

const STATUS_COLOR = {
  PLAN_PENDING_APPROVAL: "bg-orange-100 text-orange-600",
  EVENT_PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-blue-100 text-blue-600",
  ONGOING: "bg-green-100 text-green-600",
  COMPLETED: "bg-indigo-100 text-indigo-600",
  CANCELLED: "bg-red-100 text-red-600",
  DRAFT: "bg-gray-100 text-gray-600",
};

/* ================= MAIN ================= */
const EventPage = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("Tất cả");

  const [page, setPage] = useState(1);
  const perPage = 8;

  /* ===== FETCH ===== */
  const fetchAdminAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getAdminAllEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminAll();
  }, [fetchAdminAll]);

  /* ===== STATISTICS ===== */
  const stats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => e.status === "PUBLISHED").length;
    const ongoing = events.filter(e => e.status === "ONGOING").length;
    const completed = events.filter(e => e.status === "COMPLETED").length;
    const totalRegistered = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

    return {
      total,
      upcoming,
      ongoing,
      completed,
      totalRegistered
    };
  }, [events]);

  /* ===== FILTER ===== */
  const filteredEvents = useMemo(() => {
    return events
      .filter(e => 
        e.title?.toLowerCase().includes(search.toLowerCase())
      )
      .filter(e => {
        if (statusFilter !== "ALL") return e.status === statusFilter;
        return true;
      });
  }, [events, search, statusFilter]);

  const totalPages = Math.ceil(filteredEvents.length / perPage);
  const currentEvents = filteredEvents.slice((page - 1) * perPage, page * perPage);

  /* ===== ACTION ===== */
  const approveEvent = async (id) => {
    await eventService.approveEvent(id);
    fetchAdminAll();
  };

  const approvePlan = async (id) => {
    await eventService.approvePlan(id);
    fetchAdminAll();
  };

  const rejectPlan = async (id) => {
    const reason = prompt("Lý do từ chối:");
    if (!reason) return;
    await eventService.rejectPlan(id, reason);
    fetchAdminAll();
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">©</div>
          <h1 className="text-2xl font-semibold text-slate-800">Quản lý sự kiện</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/create-event")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            <Plus size={18} />
            Tạo sự kiện mới
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
            <Calendar size={18} />
            Bài truyền thông
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar size={28} />
            <div>
              <p className="text-sm opacity-90">Tổng sự kiện</p>
              <p className="text-3xl font-semibold mt-1">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Clock size={28} />
            <div>
              <p className="text-sm opacity-90">Sắp diễn ra</p>
              <p className="text-3xl font-semibold mt-1">{stats.upcoming}</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <PlayCircle size={28} />
            <div>
              <p className="text-sm opacity-90">Đang diễn ra</p>
              <p className="text-3xl font-semibold mt-1">{stats.ongoing}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div>
              <p className="text-sm opacity-90">Đã hoàn thành</p>
              <p className="text-3xl font-semibold mt-1">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Users size={28} />
            <div>
              <p className="text-sm opacity-90">Tổng đăng ký</p>
              <p className="text-3xl font-semibold mt-1">{stats.totalRegistered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b mb-6 overflow-x-auto pb-1">
        {["Tất cả", "Sắp tới", "Đang diễn ra", "Hoàn thành", "Đã hủy", "Chờ phê duyệt lại"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
            {tab === "Tất cả" && <span className="ml-1.5 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">4</span>}
            {tab === "Hoàn thành" && <span className="ml-1.5 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">4</span>}
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="pl-11 pr-4 py-3 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 min-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.keys(STATUS_LABELS).map(k => (
            <option key={k} value={k}>
              {STATUS_LABELS[k]}
            </option>
          ))}
        </select>

        <div className="flex-1 flex gap-3 justify-end">
          <button className="px-4 py-3 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-all">
            Sớm nhất
          </button>
          <button className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all">
            Đặt lại
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-3 text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-medium text-gray-600">Tên sự kiện</th>
                <th className="p-4 text-left font-medium text-gray-600">Địa điểm</th>
                <th className="p-4 text-left font-medium text-gray-600">Thời gian</th>
                <th className="p-4 text-left font-medium text-gray-600">Trạng thái</th>
                <th className="p-4 text-center font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentEvents.length > 0 ? (
                currentEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{e.title}</td>
                    <td className="p-4 text-gray-600">{e.location || "Chưa cập nhật"}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(e.startTime).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[e.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[e.status] || e.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5">
                        {/* Nút Xem chi tiết - Chuyển sang trang Detail */}
                        <button
                          onClick={() => navigate(`/admin/events/${e.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-all"
                          title="Xem chi tiết sự kiện"
                        >
                          <Eye size={18} />
                        </button>

                        {e.status === "PLAN_PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() => approvePlan(e.id)}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-all"
                              title="Duyệt kế hoạch"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => rejectPlan(e.id)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                        {e.status === "EVENT_PENDING_APPROVAL" && (
                          <button
                            onClick={() => approveEvent(e.id)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                            title="Duyệt sự kiện"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Không tìm thấy sự kiện nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            disabled={page === 1}
          >
            <ChevronLeft size={20} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                page === num 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventPage;