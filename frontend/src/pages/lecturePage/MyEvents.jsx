import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  BarChart2,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Tag,
  ChevronRight,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Dữ liệu mẫu mở rộng với các field quan trọng
  const events = [
    {
      id: 1,
      title: "Hội thảo AI & Machine Learning 2026",
      type: "Hội thảo",
      location: "Hội trường A",
      date: "15/02/2026",
      status: "Sắp diễn ra",
      registered: 120,
      maxParticipants: 150,
      points: 5,
    },
    {
      id: 2,
      title: "Workshop Kỹ năng viết CV & Phỏng vấn",
      type: "Workshop",
      location: "Phòng Lab 202",
      date: "10/02/2026",
      status: "Đang diễn ra",
      registered: 85,
      maxParticipants: 100,
      points: 3,
    },
    {
      id: 3,
      title: "IUH Career Day - Kết nối doanh nghiệp",
      type: "Hướng nghiệp",
      location: "Sân vận động",
      date: "01/01/2026",
      status: "Đã kết thúc",
      registered: 500,
      maxParticipants: 500,
      points: 10,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Sự kiện của tôi
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Bạn có {events.length} sự kiện trong danh sách quản lý
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-all">
            <Download size={18} /> Xuất báo cáo
          </button>
          <button
            onClick={() => navigate("/lecturer/events/create")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
          >
            <Plus size={20} /> Tạo mới
          </button>
        </div>
      </div>

      {/* Filter & Table Area */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên, địa điểm, loại sự kiện..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Tất cả trạng thái</option>
              <option>Đang diễn ra</option>
              <option>Sắp diễn ra</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-250">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Sự kiện & Loại
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Địa điểm & Ngày
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Đăng ký
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Điểm RL
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {events.map((event) => {
                const percent = Math.round(
                  (event.registered / event.maxParticipants) * 100,
                );

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Tag size={12} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <MapPin size={14} className="text-rose-500" />{" "}
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                          <CalendarIcon size={14} /> {event.date}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="w-40">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-500">
                            {event.registered}/{event.maxParticipants} SV
                          </span>
                          <span
                            className={
                              percent > 90 ? "text-rose-500" : "text-blue-600"
                            }
                          >
                            {percent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            className={`h-full ${percent > 90 ? "bg-rose-500" : "bg-blue-500"}`}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg font-black text-xs">
                        +{event.points}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                          event.status === "Đang diễn ra"
                            ? "bg-emerald-50 text-emerald-600"
                            : event.status === "Sắp diễn ra"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Xem báo cáo"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <BarChart2 size={18} />
                        </button>
                        <button
                          title="Sửa"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          title="Xóa"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          title="Xem chi tiết"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-6 bg-slate-50/30 flex justify-between items-center border-t border-slate-50">
          <p className="text-xs font-medium text-slate-500">
            Hiển thị 3 trên 3 sự kiện
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all"
              disabled
            >
              {" "}
              Trước
            </button>
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white shadow-md shadow-blue-100">
              1
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
              Sau
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MyEvents;
