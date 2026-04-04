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
  Calendar
} from "lucide-react";

// IMPORT CONTEXT
import { useAuth } from "../../context/AuthContext";
import { useEvent } from "../../context/EventContext";

const AdminPostManagement = ({ eventId, eventTitle }) => {
  // LẤY DATA VÀ SERVICE TỪ CONTEXT
  const { user } = useAuth();
  const { 
    posts, 
    fetchAllPosts, 
    createPost, 
    updatePost, 
    deletePost,
    events: eventService 
  } = useEvent();

  const [allEvents, setAllEvents] = useState([]);
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

  // Các loại bài đăng (Giữ nguyên)
  const POST_TYPES = {
    ANNOUNCEMENT: { label: "Thông báo", color: "blue", icon: Megaphone },
    NEWS: { label: "Tin tức", color: "green", icon: Newspaper },
    UPDATE: { label: "Cập nhật", color: "orange", icon: RefreshCw },
    RECAP: { label: "Tổng kết", color: "purple", icon: FileText },
    FEEDBACK: { label: "Phản hồi", color: "yellow", icon: MessageCircle }
  };

  // Trạng thái bài đăng (Giữ nguyên)
  const POST_STATUS = {
    DRAFT: { label: "Nháp", color: "gray", icon: FileText },
    PENDING: { label: "Chờ duyệt", color: "yellow", icon: Clock },
    PUBLISHED: { label: "Đã đăng", color: "green", icon: CheckCircle },
    REJECTED: { label: "Từ chối", color: "red", icon: XCircle },
    SCHEDULED: { label: "Đã lên lịch", color: "blue", icon: Calendar }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi fetch bài đăng từ Context
      await fetchAllPosts({ size: 1000 });
      // Lấy danh sách sự kiện từ service trong context
      const res = await eventService.getAllEvents();
      setAllEvents(res.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchAllPosts, eventService]);

  useEffect(() => {
    if (user) loadData();
  }, [user, eventId, loadData]);

  const filteredPosts = (posts || []).filter(post => {
    const matchSearch = searchTerm === "" || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || post.status === statusFilter;
    const matchType = typeFilter === "all" || post.postType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  // Pagination (Giữ nguyên)
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Save post (Sửa logic lấy accountId từ AuthContext)
  const handleSavePost = async () => {
    try {
      const payload = { 
        ...formData, 
        createdByAccountId: user?.id || user?.accountId,
        eventId: formData.eventId || eventId 
      };
      
      if (modalMode === "create") {
        await createPost(payload);
      } else {
        await updatePost(selectedPost.id, payload);
      }
      
      await fetchAllPosts({ size: 1000 }); // Refresh data
      setIsModalOpen(false);
      alert(modalMode === "create" ? "Tạo bài đăng thành công!" : "Cập nhật thành công!");
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  // Delete post (Dùng hàm từ Context)
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài đăng này?")) return;
    try {
      await deletePost(postId);
      await fetchAllPosts({ size: 1000 });
      alert("Xóa bài đăng thành công!");
    } catch (error) {
      alert("Lỗi khi xóa bài đăng.");
    }
  };

  // Stats (Giữ nguyên logic)
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === "PUBLISHED").length,
    draft: posts.filter(p => p.status === "DRAFT").length,
    pending: posts.filter(p => p.status === "PENDING").length,
    totalComments: posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
  };

  // ==================== UI HOÀN TOÀN GIỮ NGUYÊN ====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý bài đăng
          </h2>
          <p className="text-gray-500 text-sm">
            Sự kiện: {eventTitle} • {stats.total} bài đăng
          </p>
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setFormData({ title: "", content: "", postType: "ANNOUNCEMENT", status: "DRAFT", publishedAt: null, eventId: eventId || "" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tạo bài đăng
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tổng số" value={stats.total} icon={FileText} color="blue" />
        <StatCard label="Đã đăng" value={stats.published} icon={CheckCircle} color="green" />
        <StatCard label="Nháp" value={stats.draft} icon={FileText} color="gray" />
        <StatCard label="Bình luận" value={stats.totalComments} icon={MessageCircle} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm bài đăng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(POST_STATUS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            {Object.entries(POST_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Posts Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài đăng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tương tác</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPosts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{post.content}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <TypeBadge type={post.postType} postTypes={POST_TYPES} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={post.status} postStatus={POST_STATUS} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        {post.comments?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={14} />
                        {post.likes || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setFormData({ ...post, eventId: post.eventId || post.event?.id || "" });
                          setModalMode("edit");
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PostModal
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSavePost}
          onClose={() => setIsModalOpen(false)}
          postTypes={POST_TYPES}
          postStatus={POST_STATUS}
          userEvents={allEvents}
        />
      )}
    </div>
  );
};

// CÁC SUB-COMPONENT GIỮ NGUYÊN HOÀN TOÀN
const TypeBadge = ({ type, postTypes }) => {
  const typeConfig = postTypes[type];
  if (!typeConfig) return null;
  const colors = { blue: "bg-blue-100 text-blue-700", green: "bg-green-100 text-green-700", orange: "bg-orange-100 text-orange-700", purple: "bg-purple-100 text-purple-700", yellow: "bg-yellow-100 text-yellow-700" };
  return <span className={`px-2 py-1 text-xs rounded-full ${colors[typeConfig.color] || "bg-gray-100"}`}>{typeConfig.label}</span>;
};

const StatusBadge = ({ status, postStatus }) => {
  const statusConfig = postStatus[status];
  if (!statusConfig) return null;
  const IconComponent = statusConfig.icon;
  const colors = { green: "text-green-600", gray: "text-gray-600", yellow: "text-yellow-600", red: "text-red-600", blue: "text-blue-600" };
  return (
    <span className={`flex items-center gap-1 text-sm ${colors[statusConfig.color] || "text-gray-600"}`}>
      {IconComponent && <IconComponent size={14} />}
      {statusConfig.label}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const bgs = { blue: "bg-blue-100", green: "bg-green-100", gray: "bg-gray-100", purple: "bg-purple-100" };
  const texts = { blue: "text-blue-600", green: "text-green-600", gray: "text-gray-600", purple: "text-purple-600" };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 ${bgs[color] || "bg-gray-100"} rounded-lg`}>
          <Icon size={20} className={texts[color] || "text-gray-600"} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="text-sm text-gray-500 mt-2">{label}</p>
    </div>
  );
};

const PostModal = ({ mode, formData, setFormData, onSave, onClose, postTypes, postStatus, userEvents }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <div className="p-6 border-b"><h3 className="text-lg font-bold">{mode === "create" ? "Tạo bài đăng mới" : "Chỉnh sửa bài đăng"}</h3></div>
        <div className="p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Tiêu đề *</label><input type="text" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium mb-1">Nội dung *</label><textarea value={formData.content || ""} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-medium mb-1">Sự kiện áp dụng</label><select value={formData.eventId || ""} onChange={(e) => setFormData({ ...formData, eventId: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"><option value="">-- Chọn sự kiện --</option>{userEvents?.map((ev) => (<option key={ev.id} value={ev.id}>{ev.title}</option>))}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Loại</label><select value={formData.postType} onChange={(e) => setFormData({ ...formData, postType: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none">{Object.entries(postTypes).map(([k, { label }]) => (<option key={k} value={k}>{label}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Trạng thái</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none">{Object.entries(postStatus).map(([k, { label }]) => (<option key={k} value={k}>{label}</option>))}</select></div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{mode === "create" ? "Tạo bài đăng" : "Cập nhật"}</button>
        </div>
      </form>
    </div>
  </div>
);

export default AdminPostManagement;