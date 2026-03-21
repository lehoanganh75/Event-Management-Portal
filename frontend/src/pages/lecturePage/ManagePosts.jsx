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
  X
} from "lucide-react";
import { getMyEvents } from "../../api/eventApi";

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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let accountId = null;
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          accountId = user.id || user.accountId || user.account?.id || user.userId;
        } catch (error) {}
      }

      if (!accountId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            accountId = payload.accountId || payload.sub || payload.userId || payload.id;
          } catch (e) {}
        }
      }

      const url = accountId 
        ? `http://localhost:8081/api/posts/user/${accountId}`
        : `http://localhost:8081/api/posts`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.content) {
        setPosts(data.content);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối đến server.");
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
      const url = modalMode === "create" 
        ? `http://localhost:8081/api/posts`
        : `http://localhost:8081/api/posts/${selectedPost.id}`;
      
      const method = modalMode === "create" ? "POST" : "PUT";
      
      let accountId = null;
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          accountId = user.id || user.accountId || user.account?.id || user.userId;
        } catch (error) {}
      }
      
      if (!accountId) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            accountId = payload.accountId || payload.sub || payload.userId || payload.id;
          } catch (e) {}
        }
      }

      const payload = { ...formData };
      if (modalMode === "create") {
        if (accountId) payload.createdByAccountId = accountId;
        if (!payload.eventId && eventId) payload.eventId = eventId;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        fetchPosts();
        setIsModalOpen(false);
        alert(modalMode === "create" ? "Tạo bài đăng thành công!" : "Cập nhật bài đăng thành công!");
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài đăng này?")) return;
    
    try {
      const response = await fetch(`http://localhost:8081/api/posts/${postId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        fetchPosts();
        alert("Xóa bài đăng thành công!");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(POST_STATUS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">Tất cả loại</option>
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
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "N/A"}
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
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">
              {mode === "create" ? "Tạo bài đăng mới" : "Chỉnh sửa bài đăng"}
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề bài đăng"
                required
              />
            </div>
            
            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung *</label>
              <textarea
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập nội dung bài đăng..."
                required
              />
            </div>
            
            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Sự kiện áp dụng</label>
              <select
                value={formData.eventId || ""}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn sự kiện (Tùy chọn) --</option>
                {userEvents?.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            {/* Post Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Loại bài đăng</label>
              <select
                value={formData.postType || "ANNOUNCEMENT"}
                onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(postTypes).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                value={formData.status || "DRAFT"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(postStatus).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Published At */}
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian hiển thị (Tùy chọn)</label>
              <input
                type="datetime-local"
                value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="p-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === "create" ? "Tạo bài đăng" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostManagement;