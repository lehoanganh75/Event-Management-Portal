import React, { useState, useEffect } from "react";
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
  X,
  Type,
  Layout,
  User,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import eventService from "../../services/eventService";

const PostManagement = ({ eventId, eventTitle }) => {
  const [posts, setPosts] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    postType: "ANNOUNCEMENT",
    status: "DRAFT",
    publishedAt: null
  });

  const ITEMS_PER_PAGE = 10;

  const POST_TYPES = {
    ANNOUNCEMENT: { label: "Thông báo", color: "blue", icon: Megaphone },
    NEWS: { label: "Tin tức", color: "green", icon: Newspaper },
    UPDATE: { label: "Cập nhật", color: "orange", icon: RefreshCw },
    RECAP: { label: "Tổng kết", color: "purple", icon: FileText },
    FEEDBACK: { label: "Phản hồi", color: "yellow", icon: MessageCircle }
  };

  const POST_STATUS = {
    DRAFT: { label: "Nháp", color: "gray", icon: FileText },
    PENDING: { label: "Chờ duyệt", color: "yellow", icon: Clock },
    PUBLISHED: { label: "Đã đăng", color: "green", icon: CheckCircle },
    REJECTED: { label: "Từ chối", color: "red", icon: XCircle },
    SCHEDULED: { label: "Đã lên lịch", color: "blue", icon: Calendar }
  };

  const getUserId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.accountId || user.account?.id || user.id || user.userId;
    }
    return null;
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const accountId = getUserId();
      let response;

      if (accountId) {
        response = await eventService.getPostsByUser(accountId);
      } else {
        response = await eventService.getAllPosts({ size: 100 });
      }

      // Đảm bảo dữ liệu được map qua helper của API để chuẩn hóa các trường (createdAt, date, ...)
      const rawData = response.data.content || response.data;
      const mappedData = Array.isArray(rawData) 
        ? rawData.map(p => ({
            ...p,
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "N/A"
          }))
        : [];
        
      setPosts(mappedData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [eventId, searchTerm, statusFilter]);

  const filteredPosts = posts.filter(post => {
    const matchSearch = searchTerm === "" || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || post.status === statusFilter;
    const matchType = typeFilter === "all" || post.postType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSavePost = async () => {
    try {
      const accountId = getUserId();
      const payload = { 
        ...formData,
        accountId: accountId,
        eventId: formData.eventId || eventId 
      };

      if (modalMode === "create") {
        await eventService.createPost(payload);
      } else {
        await eventService.updatePost(selectedPost.id, payload);
      }

      fetchPosts();
      setIsModalOpen(false);
      alert("Thành công!");
    } catch (error) {
      console.error("Error saving post:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await eventService.deletePost(deleteId);
      fetchPosts();
      setDeleteId(null);
      alert("Xóa thành công!");
    } catch (error) {
      alert("Lỗi khi xóa bài viết");
    }
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === "PUBLISHED").length,
    draft: posts.filter(p => p.status === "DRAFT").length,
    pending: posts.filter(p => p.status === "PENDING").length,
    totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
  };

  return (
    <div className="space-y-6 min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Quản lý bài đăng
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Sự kiện: {eventTitle} • {stats.total} bài đăng
          </p>
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setFormData({ title: "", content: "", postType: "ANNOUNCEMENT", status: "DRAFT", publishedAt: null, eventId: eventId || "" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} />
          Tạo bài đăng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tổng số bài" value={stats.total} icon={FileText} color="blue" />
        <StatCard label="Đã xuất bản" value={stats.published} icon={CheckCircle} color="green" />
        <StatCard label="Bản nháp" value={stats.draft} icon={FileText} color="slate" />
        <StatCard label="Lượt bình luận" value={stats.totalComments} icon={MessageCircle} color="purple" />
      </div>

      {/* TABS (Styled like AccountsPage) */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2">
        {[
          { id: "all", label: "Tất cả", icon: Newspaper, count: stats.total },
          { id: "PUBLISHED", label: "Đã đăng", icon: CheckCircle, count: stats.published },
          { id: "PENDING", label: "Chờ duyệt", icon: Clock, count: stats.pending },
          { id: "DRAFT", label: "Bản nháp", icon: FileText, count: stats.draft },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              statusFilter === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              statusFilter === tab.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm bài đăng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all">Tất cả loại bài</option>
            {Object.entries(POST_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Bài đăng</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4">Tương tác</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-slate-800 mb-1">{post.title}</div>
                        <div className="text-xs font-medium text-slate-500 line-clamp-1 max-w-md">{post.content}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TypeBadge type={post.postType} postTypes={POST_TYPES} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={post.status} postStatus={POST_STATUS} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                          <MessageCircle size={14} className="text-purple-500" />
                          {post.comments?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                          <ThumbsUp size={14} className="text-blue-500" />
                          {post.likes || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {post.date || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setFormData({ ...post, eventId: post.eventId || post.event?.id || "" });
                            setModalMode("edit");
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        
                        <button
                          onClick={() => setDeleteId(post.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedPosts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-slate-500 font-medium">Không có bài đăng nào phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <PostModal
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSavePost}
          onClose={() => setIsModalOpen(false)}
          postTypes={POST_TYPES}
          postStatus={POST_STATUS}
          userEvents={userEvents}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="text-rose-500" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Xác nhận xóa</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-100"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TypeBadge = ({ type, postTypes }) => {
  const typeConfig = postTypes[type];
  if (!typeConfig) return null;
  
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    orange: "bg-amber-100 text-amber-700 border-amber-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200"
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${colorClasses[typeConfig.color] || colorClasses.gray}`}>
      {typeConfig.label}
    </span>
  );
};

const StatusBadge = ({ status, postStatus }) => {
  const statusConfig = postStatus[status];
  if (!statusConfig) return null;
  
  const IconComponent = statusConfig.icon;
  const colorClasses = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    gray: "bg-slate-100 text-slate-600 border-slate-200",
    yellow: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200"
  };
  
  return (
    <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${colorClasses[statusConfig.color] || colorClasses.gray}`}>
      {statusConfig.label}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const bgColorClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    gray: "bg-gray-100",
    purple: "bg-purple-100"
  };
  
  const textColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    gray: "text-gray-600",
    purple: "text-purple-600"
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 ${bgColorClasses[color] || "bg-gray-100"} rounded-lg`}>
          <Icon size={20} className={textColorClasses[color] || "text-gray-600"} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="text-sm text-gray-500 mt-2">{label}</p>
    </div>
  );
};

// Post Modal Component
const PostModal = ({ mode, formData, setFormData, onSave, onClose, postTypes, postStatus, userEvents }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 font-sans"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between relative">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${mode === 'create' ? 'bg-blue-600 shadow-blue-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
                {mode === 'create' ? <Plus className="text-white" size={28} /> : <Edit2 className="text-white" size={28} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                  {mode === "create" ? "Tạo bài đăng" : "Chỉnh sửa"}
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Cấu hình nội dung bài viết</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-4">
            <div className="space-y-6">
              {/* Title Section */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Type size={12} className="text-blue-500" /> Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề thu hút..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  required
                />
              </div>
              
              {/* Content Section */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Layout size={12} className="text-blue-500" /> Nội dung chi tiết
                </label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Viết nội dung bài đăng của bạn tại đây..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-semibold text-slate-600 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} className="text-blue-500" /> Sự kiện liên kết
                  </label>
                  <div className="relative">
                    <select
                      value={formData.eventId || ""}
                      onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                      className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Không liên kết sự kiện</option>
                      {userEvents?.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Hash size={12} className="text-blue-500" /> Phân loại
                  </label>
                  <div className="relative">
                    <select
                      value={formData.postType || "ANNOUNCEMENT"}
                      onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                      className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 appearance-none cursor-pointer transition-all"
                    >
                      {Object.entries(postTypes).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <RefreshCw size={12} className="text-blue-500" /> Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status || "DRAFT"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 appearance-none cursor-pointer transition-all"
                    >
                      {Object.entries(postStatus).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Published At */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock size={12} className="text-blue-500" /> Hẹn giờ đăng
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-[1.5rem] font-black text-slate-500 hover:bg-slate-50 transition-all uppercase text-xs border-2 border-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={`flex-[2] py-4 px-6 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 uppercase text-xs ${mode === 'create' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
              >
                {mode === "create" ? "Tạo bài viết ngay" : "Cập nhật thay đổi"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostManagement;