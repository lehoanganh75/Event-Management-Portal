import React, { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Share2,
  Edit3,
} from "lucide-react";
import { EventPlanner } from "./EventPlanner";

const ManagePlans = () => {
  const [viewMode, setViewMode] = useState("LIST");
  const [showActions, setShowActions] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const plans = [
    {
      id: "PL001",
      title: "Kế hoạch hội thảo AI",
      date: "20/02/2026",
      status: "Chờ duyệt",
    },
    {
      id: "PL002",
      title: "Tổ chức Team Building",
      date: "15/03/2026",
      status: "Đã duyệt",
    },
    {
      id: "PL003",
      title: "Workshop React Advanced",
      date: "25/03/2026",
      status: "Chờ duyệt",
    },
    {
      id: "PL004",
      title: "Seminar Blockchain",
      date: "10/04/2026",
      status: "Từ chối",
    },
  ];

  const handleAction = (action, planId) => {
    console.log(`${action} plan ${planId}`);
    setShowActions(null);
    alert(`${action} kế hoạch ${planId}`);
  };

  const filteredPlans = plans.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (viewMode === "CREATE") {
    return <EventPlanner onBack={() => setViewMode("LIST")} />;
  }

  return (
    <div className="space-y-6 p-4 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Quản lý kế hoạch
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Lập lịch và theo dõi tiến độ các kế hoạch sự kiện.
          </p>
        </div>
        <button
          onClick={() => setViewMode("CREATE")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
        >
          <Plus size={18} /> Tạo kế hoạch mới
        </button>
      </div>

      {/* Main Content Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm mã hoặc tên kế hoạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã KH</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên kế hoạch</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày dự kiến</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác nhanh</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy kế hoạch nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {p.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          p.status === "Đã duyệt"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Từ chối"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleAction("Chỉnh sửa", p.id)}
                          title="Chỉnh sửa"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleAction("Chia sẻ", p.id)}
                          title="Chia sẻ"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => handleAction("Xóa", p.id)}
                          title="Xóa"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setShowActions(showActions === p.id ? null : p.id)
                          }
                          className={`p-2 rounded-lg transition-all ${showActions === p.id ? "bg-slate-200 text-slate-900" : "text-slate-400 hover:bg-slate-100"}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {showActions === p.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowActions(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 animate-in fade-in zoom-in duration-100">
                              <button
                                onClick={() =>
                                  handleAction("Xem chi tiết", p.id)
                                }
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye size={14} /> Xem chi tiết
                              </button>
                              <button
                                onClick={() => handleAction("Tải xuống", p.id)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Download size={14} /> Tải xuống PDF
                              </button>

                              {p.status === "Chờ duyệt" && (
                                <>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button
                                    onClick={() =>
                                      handleAction("Phê duyệt", p.id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 font-medium"
                                  >
                                    <CheckCircle size={14} /> Phê duyệt
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction("Từ chối", p.id)
                                    }
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                  >
                                    <XCircle size={14} /> Từ chối
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            Hiển thị{" "}
            <span className="text-slate-900">{filteredPlans.length}</span> trên{" "}
            <span className="text-slate-900">{plans.length}</span> kế hoạch
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
    </div>
  );
};

export default ManagePlans;
