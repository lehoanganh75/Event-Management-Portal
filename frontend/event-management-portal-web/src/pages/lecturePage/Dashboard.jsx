import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Users,
  RefreshCw,
  Zap,
  Target,
  FileText,
  ChevronRight,
  MapPin,
  Eye,
  TrendingUp,
  Award,
  CalendarCheck,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    completionRate: 0,
  });
  const navigate = useNavigate();
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, totalParticipants] = await Promise.all([
        getAllEvents(),
        getTotalParticipants(),
      ]);

      const allEvents = eventsRes.data || [];
      const active = allEvents.filter(
        (e) => e.status === "ONGOING" || e.status === "PUBLISHED",
      ).length;
      const completed = allEvents.filter(
        (e) => e.status === "COMPLETED",
      ).length;
      const rate =
        allEvents.length > 0
          ? ((completed / allEvents.length) * 100).toFixed(1)
          : 0;

      setEvents(allEvents.slice(0, 5));
      setStats({
        totalEvents: allEvents.length,
        activeEvents: active,
        totalParticipants: totalParticipants,
        completionRate: rate,
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusData = () => {
    const counts = events.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        name: "Đang diễn ra",
        value: counts["ONGOING"] || 0,
        color: "#3B82F6",
        icon: Activity,
      },
      {
        name: "Đã xuất bản",
        value: counts["PUBLISHED"] || 0,
        color: "#10B981",
        icon: CheckCircle,
      },
      {
        name: "Chờ duyệt",
        value: counts["PENDING_APPROVAL"] || 0,
        color: "#F59E0B",
        icon: Clock,
      },
      {
        name: "Hoàn thành",
        value: counts["COMPLETED"] || 0,
        color: "#6B7280",
        icon: Award,
      },
    ].filter((item) => item.value > 0);
  };

  const getStatusBadge = (status) => {
    const config = {
      PUBLISHED: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Đã xuất bản",
        icon: CheckCircle,
      },
      ONGOING: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Đang diễn ra",
        icon: Activity,
      },
      PENDING_APPROVAL: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Chờ duyệt",
        icon: Clock,
      },
      COMPLETED: {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        label: "Hoàn thành",
        icon: Award,
      },
      REJECTED: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Từ chối",
        icon: XCircle,
      },
    };
    const cfg = config[status] || config.PENDING_APPROVAL;
    const Icon = cfg.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.color}`}
      >
        <Icon size={12} />
        {cfg.label}
      </span>
    );
  };

  // Sample chart data (có thể thay bằng dữ liệu thực từ API)
  const trendData = [
    { month: "T1", participants: 120, events: 4 },
    { month: "T2", participants: 180, events: 6 },
    { month: "T3", participants: 250, events: 8 },
    { month: "T4", participants: 150, events: 5 },
    { month: "T5", participants: 210, events: 7 },
    { month: "T6", participants: 320, events: 9 },
  ];

  const StatCard = ({ label, value, icon: Icon, color, trend, trendValue }) => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-8 -mt-8 opacity-50" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              <TrendingUp size={12} className={trend > 0 ? "" : "rotate-180"} />
              <span>{Math.abs(trend)}% so với tháng trước</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} shadow-lg flex items-center justify-center`}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Bảng điều khiển
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Quản lý sự kiện toàn diện
              </p>
            </div>
            <button
              onClick={fetchData}
              className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw
                size={18}
                className={`inline mr-2 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
              />
              <span className="text-sm font-medium">Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Tổng sự kiện"
            value={stats.totalEvents}
            icon={Calendar}
            color="from-blue-500 to-blue-600"
            trend={12.5}
          />
          <StatCard
            label="Đang diễn ra"
            value={stats.activeEvents}
            icon={Activity}
            color="from-emerald-500 to-emerald-600"
            trend={8.2}
          />
          <StatCard
            label="Lượt đăng ký"
            value={stats.totalParticipants.toLocaleString()}
            icon={Users}
            color="from-purple-500 to-purple-600"
            trend={15.3}
          />
          <StatCard
            label="Hoàn thành"
            value={`${stats.completionRate}%`}
            icon={Target}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Xu hướng tham gia
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Số lượng người tham gia theo tháng
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-xs text-gray-500">Người tham gia</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient
                    id="colorParticipants"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    padding: "8px 12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="participants"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#colorParticipants)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Phân bố trạng thái
            </h3>
            {getStatusData().length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={getStatusData()}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {getStatusData().map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Icon size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-600 flex-1">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">
                <PieChart size={48} className="mb-2" />
                <p className="text-sm">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Sự kiện gần đây
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Danh sách các sự kiện mới nhất
              </p>
            </div>
            <button
              onClick={() => navigate("/lecturer/events/my-events")}
              className="hover:cursor-pointer text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              Xem tất cả
              <ChevronRight size={16} />
            </button>
          </div>

          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sự kiện
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Địa điểm
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Đăng ký
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {events.map((event, idx) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                            <FileText size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {event.organizerUnit || event.faculty || "IUH"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {event.eventDate || "Chưa cập nhật"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">
                            {event.location || event.eventMode || "Trực tuyến"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-600 min-w-[40px]">
                            {event.registeredCount || 0}
                          </span>
                          <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(((event.registeredCount || 0) / (event.maxParticipants || 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            /{event.maxParticipants || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 opacity-0 group-hover:opacity-100 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                          <Eye size={16} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Chưa có sự kiện nào</p>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400">Tỷ lệ tham gia trung bình</p>
            <p className="text-xl font-bold text-gray-800 mt-1">68%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400">Sự kiện sắp diễn ra</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              {stats.activeEvents}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400">Đánh giá trung bình</p>
            <p className="text-xl font-bold text-gray-800 mt-1">
              4.8 <span className="text-sm text-yellow-500">★</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400">Đơn vị tổ chức</p>
            <p className="text-xl font-bold text-gray-800 mt-1">12</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
