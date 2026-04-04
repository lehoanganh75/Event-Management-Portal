import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, Search,
  MessageCircle, ThumbsUp, ChevronLeft, ChevronRight, Megaphone,
  Newspaper, RefreshCw, Calendar, X
} from "lucide-react";
import { useEvent } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";

const PostManagement = ({ eventId, eventTitle }) => {
  const { 
    posts, 
    loading, 
    fetchAllPosts, 
    createPost, 
    updatePost, 
    deletePost,
    myEvents 
  } = useEvent();
  
  const { user } = useAuth();

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
    publishedAt: null,
    eventId: eventId || ""
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

  // Fetch data
  const loadData = async () => {
    const accountId = user?.id || user?.accountId;
    if (!accountId) return;
    
    const params = {
      accountId: accountId,
      eventId: eventId || undefined,
    };
    await fetchAllPosts(params);
  };

  useEffect(() => {
    loadData();
  }, [eventId, user]);

  // Client-side filtering
  const filteredPosts = (posts || []).filter(post => {
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
      const accountId = user?.id || user?.accountId;
      const payload = { 
        ...formData,
        createdByAccountId: accountId,
        eventId: formData.eventId || eventId 
      };

      if (modalMode === "create") {
        await createPost(payload);
      } else {
        await updatePost(selectedPost.id, payload);
      }

      await loadData();
      setIsModalOpen(false);
      alert("Thao tác thành công!");
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;
    try {
      await deletePost(postId);
      await loadData();
      alert("Đã xóa bài đăng!");
    } catch (error) {
      alert("Không thể xóa bài đăng");
    }
  };

  const stats = {
    total: filteredPosts.length,
    published: filteredPosts.filter(p => p.status === "PUBLISHED").length,
    draft: filteredPosts.filter(p => p.status === "DRAFT").length,
    totalComments: filteredPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)
  };

  return (
    <div className="space-y-6 min-h-screen bg-slate-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý bài đăng</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Sự kiện: {eventTitle || "Tất cả"} • {stats.total} kết quả
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
          <Plus size={18} /> Tạo bài đăng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Đang hiển thị" value={stats.total} icon={FileText} color="blue" />
        <StatCard label="Đã xuất bản" value={stats.published} icon={CheckCircle} color="green" />
        <StatCard label="Bản nháp" value={stats.draft} icon={Clock} color="slate" />
        <StatCard label="Bình luận" value={stats.totalComments} icon={MessageCircle} color="purple" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none">
            <option value="all">Mọi trạng thái</option>
            {Object.entries(POST_STATUS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none">
            <option value="all">Mọi loại bài</option>
            {Object.entries(POST_TYPES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </div>

      {loading.posts ? (
        <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Thông tin bài đăng</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4">Tương tác</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPosts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/50 group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{post.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{post.content}</div>
                    </td>
                    <td className="px-6 py-4"><TypeBadge type={post.postType} postTypes={POST_TYPES} /></td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={post.status} postStatus={POST_STATUS} /></td>
                    <td className="px-6 py-4">
                       <div className="flex gap-3 text-xs font-bold text-slate-400">
                         <span className="flex items-center gap-1"><ThumbsUp size={12}/> {post.likes || 0}</span>
                         <span className="flex items-center gap-1"><MessageCircle size={12}/> {post.comments?.length || 0}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedPost(post); setFormData({...post}); setModalMode("edit"); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <PostModal
          mode={modalMode} formData={formData} setFormData={setFormData}
          onSave={handleSavePost} onClose={() => setIsModalOpen(false)}
          postTypes={POST_TYPES} postStatus={POST_STATUS} userEvents={myEvents}
          isActionLoading={loading.action}
        />
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    slate: "bg-slate-100 text-slate-600"
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}><Icon size={20} /></div>
        <span className="text-2xl font-black text-slate-800">{value}</span>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase mt-3 tracking-tighter">{label}</p>
    </div>
  );
};

const TypeBadge = ({ type, postTypes }) => {
  const config = postTypes[type] || { label: type, color: "gray" };
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    gray: "bg-slate-50 text-slate-700 border-slate-100"
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${colors[config.color]}`}>
      {config.label}
    </span>
  );
};

const StatusBadge = ({ status, postStatus }) => {
  const config = postStatus[status] || { label: status, color: "gray" };
  const colors = {
    green: "bg-emerald-500 text-white",
    yellow: "bg-amber-500 text-white",
    blue: "bg-blue-500 text-white",
    red: "bg-rose-500 text-white",
    gray: "bg-slate-400 text-white"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${colors[config.color]}`}>
      {config.label}
    </span>
  );
};

const PostModal = ({ mode, formData, setFormData, onSave, onClose, postTypes, postStatus, userEvents, isActionLoading }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-black text-slate-800 uppercase">{mode === "create" ? "Tạo bài đăng mới" : "Chỉnh sửa bài đăng"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Tiêu đề bài đăng</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" placeholder="VD: Thông báo lịch trình thi đấu..."/>
             </div>
             
             <div className="col-span-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Nội dung chi tiết</label>
                <textarea required rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Viết nội dung bài đăng vào đây..."/>
             </div>

             <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Loại nội dung</label>
                <select value={formData.postType} onChange={e => setFormData({...formData, postType: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border rounded-xl outline-none font-bold">
                  {Object.entries(postTypes).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                </select>
             </div>

             <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Trạng thái</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border rounded-xl outline-none font-bold">
                  {Object.entries(postStatus).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                </select>
             </div>

             <div className="col-span-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Gán vào sự kiện</label>
                <select value={formData.eventId || ""} onChange={e => setFormData({...formData, eventId: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border rounded-xl outline-none font-bold">
                  <option value="">-- Bài đăng chung (Không gán sự kiện) --</option>
                  {userEvents?.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
             </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Hủy bỏ</button>
            <button type="submit" disabled={isActionLoading} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
              {isActionLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {mode === "create" ? "Xác nhận tạo" : "Cập nhật thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostManagement;