import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";

import {
  UserPlus,
  CheckCircle,
  TrendingUp,
  Clock,
  FileBarChart,
  Loader2
} from "lucide-react";

import eventService from "../../../services/eventService";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6"
];

const EventStatistics = ({
  summary,
  loading: initialLoading,
  eventTitle
}) => {
  const [aiAnalysis, setAiAnalysis] =
    React.useState(null);

  const [isAnalysing, setIsAnalysing] =
    React.useState(false);

  const fetchAiAnalysis = async () => {
    if (!summary || aiAnalysis) return;

    setIsAnalysing(true);

    try {
      const statsData = {
        eventTitle: eventTitle || "Sự kiện",
        totalRegistered: summary.totalRegistered,
        totalCheckedIn: summary.totalCheckedIn,
        attendanceRate: summary.attendanceRate
      };

      const res =
        await eventService.chat.analyzeStats(
          JSON.stringify(statsData)
        );

      if (
        res.data?.code === 1000 &&
        res.data.result
      ) {
        try {
          const parsed = JSON.parse(
            res.data.result
              .replace(/```json|```/g, "")
              .trim()
          );

          setAiAnalysis(parsed);
        } catch {
          setAiAnalysis({
            summary: res.data.result
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalysing(false);
    }
  };

  React.useEffect(() => {
    if (summary && !initialLoading) {
      fetchAiAnalysis();
    }
  }, [summary, initialLoading]);

  if (initialLoading) {
    return (
      <div className="p-16 text-center text-sm text-gray-500">
        Đang tải thống kê...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-16 text-center">
        <FileBarChart
          size={48}
          className="mx-auto text-gray-300 mb-4"
        />

        <h3 className="text-lg font-semibold text-gray-700">
          Chưa có dữ liệu
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Dữ liệu sẽ hiển thị khi có người đăng ký.
        </p>
      </div>
    );
  }

  const {
    detailedAnalysis,
    totalRegistered,
    totalCheckedIn,
    attendanceRate
  } = summary;

  const registrationData = useMemo(() => {
    if (
      !detailedAnalysis?.registrationTimeline
    )
      return [];

    return Object.entries(
      detailedAnalysis.registrationTimeline
    ).map(([date, count]) => ({
      name: date,
      value: count
    }));
  }, [detailedAnalysis]);

  const checkInData = useMemo(() => {
    if (!detailedAnalysis?.checkInTimeline)
      return [];

    return Object.entries(
      detailedAnalysis.checkInTimeline
    ).map(([hour, count]) => ({
      name: `${hour}h`,
      value: count
    }));
  }, [detailedAnalysis]);

  const statusData = useMemo(() => {
    if (
      !detailedAnalysis?.statusDistribution
    )
      return [];

    return Object.entries(
      detailedAnalysis.statusDistribution
    ).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [detailedAnalysis]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<UserPlus size={18} />}
          label="Đăng ký"
          value={totalRegistered}
          color="indigo"
        />

        <StatCard
          icon={<CheckCircle size={18} />}
          label="Tham gia"
          value={totalCheckedIn}
          color="emerald"
        />

        <StatCard
          icon={<Clock size={18} />}
          label="Tỷ lệ"
          value={`${attendanceRate.toFixed(1)}%`}
          color="amber"
        />

        <StatCard
          icon={<TrendingUp size={18} />}
          label="Hiệu quả"
          value={
            attendanceRate > 70
              ? "Cao"
              : attendanceRate > 40
                ? "Trung bình"
                : "Thấp"
          }
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Registration */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Đăng ký theo ngày
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Theo dõi số lượng đăng ký
              </p>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-medium">
              Timeline
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient
                    id="regGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#6366f1"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="#6366f1"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.05)"
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#regGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Checkin */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Check-in theo giờ
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Phân bổ người tham gia
              </p>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-medium">
              Realtime
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 10px 25px rgba(0,0,0,0.05)"
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Trạng thái đăng ký
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Tổng quan trạng thái
              </p>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
              Overview
            </div>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Summary */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-md text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold">
                  Đánh giá tổng quát
                </h3>

                <p className="text-xs text-indigo-100 mt-1">
                  Phân tích tự động từ AI
                </p>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px]">
                AI Insight
              </div>
            </div>

            {isAnalysing ? (
              <div className="flex items-center gap-3 text-sm text-indigo-100">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                AI đang phân tích dữ liệu...
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm leading-7 text-indigo-50">
                  {aiAnalysis?.summary ||
                    `Sự kiện đạt tỷ lệ tham gia ${attendanceRate.toFixed(
                      1
                    )}%. ${attendanceRate > 70
                      ? "Hiệu quả tổ chức tốt."
                      : attendanceRate > 40
                        ? "Mức độ tham gia khá ổn định."
                        : "Cần cải thiện khả năng thu hút người tham gia."
                    }`}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs text-indigo-100 mb-3 font-medium">
                      Điểm mạnh
                    </p>

                    <ul className="space-y-2 text-sm text-white">
                      <li>
                        • {totalRegistered} lượt đăng ký
                      </li>

                      <li>
                        • {totalCheckedIn} người tham gia
                      </li>

                      <li>
                        • Theo dõi realtime
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs text-indigo-100 mb-3 font-medium">
                      Đề xuất
                    </p>

                    <ul className="space-y-2 text-sm text-white">
                      <li>
                        • Tăng tỷ lệ check-in
                      </li>

                      <li>
                        • Tối ưu truyền thông
                      </li>

                      <li>
                        • Thu thập thêm feedback
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color = "indigo"
}) => {
  const styles = {
    indigo: {
      box: "bg-indigo-50 border-indigo-100",
      icon: "text-indigo-600",
      badge: "bg-indigo-100 text-indigo-700"
    },
    emerald: {
      box: "bg-emerald-50 border-emerald-100",
      icon: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700"
    },
    amber: {
      box: "bg-amber-50 border-amber-100",
      icon: "text-amber-600",
      badge: "bg-amber-100 text-amber-700"
    },
    rose: {
      box: "bg-rose-50 border-rose-100",
      icon: "text-rose-600",
      badge: "bg-rose-100 text-rose-700"
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center ${styles[color].box}`}
        >
          <div className={styles[color].icon}>
            {icon}
          </div>
        </div>

        <div
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${styles[color].badge}`}
        >
          Live
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <h4 className="text-2xl font-bold text-gray-800">
        {value}
      </h4>
    </div>
  );
};

export default EventStatistics;
