import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MessageCircle,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Newspaper,
  RefreshCw,
  Calendar,
  Loader2,
  Eye,
  MoreVertical
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../context/EventContext";
import { useNavigate } from "react-router-dom";

const AdminPostManagement = ({ eventId, eventTitle }) => {
  const { user } = useAuth();
  const { 
    posts, 
    loading, 
    fetchAllPosts, 
    deletePost 
  } = useEvents();

  const navigate = useNavigate();

  /* STATE */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");

  const ITEMS_PER_PAGE = 10;

  /* CONFIG */
  const POST_TYPES = {
    ANNOUNCEMENT: { label: "Thông báo", icon: Megaphone, color: "bg-amber-100 text-amber-700" },
    NEWS: { label: "Tin tức", icon: Newspaper, color: "bg-blue-100 text-blue-700" },
    UPDATE: { label: "Cập nhật", icon: RefreshCw, color: "bg-purple-100 text-purple-700" },
    RECAP: { label: "Tổng kết", icon: FileText, color: "bg-emerald-100 text-emerald-700" },
    FEEDBACK: { label: "Phản hồi", icon: MessageCircle, color: "bg-pink-100 text-pink-700" }
  };

  const POST_STATUS = {
    PUBLISHED: { label: "Đã đăng", color: "bg-emerald-100 text-emerald-700" },
    PENDING: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" }, // Màu vàng/cam cho trạng thái chờ
    DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-700" },
    REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-700" }
  };

  /* LOAD DATA */
  const loadData = useCallback(async () => {
    await fetchAllPosts({ size: 1000 });
  }, [fetchAllPosts]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  /* FILTER LOGIC */
 const filteredPosts = useMemo(() => {
    // Đảm bảo posts luôn là mảng để tránh lỗi .filter
    return (posts || []).filter((post) => {
      // 1. Logic tìm kiếm (Search)
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm || 
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower);

      // 2. Logic lọc theo Tab (Ánh xạ Tab sang Status)
      let matchTab = true;
      switch (activeTab) {
        case "Đã đăng":
          matchTab = post.status === "PUBLISHED";
          break;
        case "Chờ duyệt":
          matchTab = post.status === "PENDING";
          break;
        case "Bản nháp":
          matchTab = post.status === "DRAFT";
          break;
        case "Bị từ chối":
          matchTab = post.status === "REJECTED";
          break;
        default: // "Tất cả"
          matchTab = true;
      }

      // 3. Logic lọc theo Dropdown Status (Nếu dropdown chọn "ALL" thì bỏ qua)
      const matchStatus = statusFilter === "all" || post.status === statusFilter;

      // 4. Logic lọc theo Dropdown Loại bài đăng (Type)
      const matchType = typeFilter === "all" || post.postType === typeFilter;

      // Trả về kết quả kết hợp tất cả điều kiện
      return matchSearch && matchTab && matchStatus && matchType;
    });
  }, [posts, searchTerm, statusFilter, typeFilter, activeTab]);

  /* PAGINATION LOGIC */
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;
    await deletePost(postId);
    await loadData();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Quản lý bài đăng</h1>
            <p className="text-sm text-slate-500">{eventTitle || "Tất cả sự kiện"} • {filteredPosts.length} bài viết</p>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-100">
          <Plus size={18} />
          Tạo bài đăng mới
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b mb-6 overflow-x-auto pb-1 gap-2">
        {["Tất cả", "Đã đăng", "Chờ duyệt", "Bản nháp"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            className="pl-11 pr-4 py-3 w-full border border-gray-100 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="border border-gray-100 bg-slate-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 min-w-[160px]"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Mọi loại bài đăng</option>
          {Object.entries(POST_TYPES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>

        <button 
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setTypeFilter("all");
            setActiveTab("Tất cả");
          }}
          className="px-5 py-3 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-all"
        >
          Đặt lại
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
            <p className="mt-3 text-gray-500 font-medium">Đang tải dữ liệu bài đăng...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-700">Tiêu đề bài viết</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Loại</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Ngày tạo</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Trạng thái</th>
                  <th className="p-4 text-center font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedPosts.length > 0 ? (
                  paginatedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="max-w-[300px]">
                          <p className="font-medium text-slate-800 truncate">{post.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{post.content?.substring(0, 60)}...</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${POST_TYPES[post.postType]?.color || "bg-gray-100"}`}>
                          {post.postType && React.createElement(POST_TYPES[post.postType]?.icon || FileText, { size: 12 })}
                          {POST_TYPES[post.postType]?.label || post.postType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-medium">{new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                          <span className="text-[10px] text-gray-400">{new Date(post.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${POST_STATUS[post.status]?.color || "bg-gray-100"}`}>
                          {POST_STATUS[post.status]?.label || post.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => navigate(`/admin/posts/${post.id}`)} // Đường dẫn tới trang PostDetail
                            className="p-2 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600 transition-all" 
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button className="p-2 hover:bg-amber-50 rounded-lg text-gray-500 hover:text-amber-600 transition-all" title="Chỉnh sửa">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-all" 
                            title="Xóa bài"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                          <Search size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">Không tìm thấy bài viết nào khớp với bộ lọc</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                  currentPage === i + 1 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "bg-white border border-gray-200 text-slate-600 hover:border-blue-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPostManagement;