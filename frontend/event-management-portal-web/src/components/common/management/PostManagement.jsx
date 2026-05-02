import React, { useState, useMemo, useCallback } from "react";
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
  MoreVertical,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import eventService from "../../../services/eventService";

const POST_TYPES = {
  ANNOUNCEMENT: { label: "Thông báo", icon: Megaphone, color: "bg-amber-100 text-amber-700" },
  NEWS: { label: "Tin tức", icon: Newspaper, color: "bg-blue-100 text-blue-700" },
  UPDATE: { label: "Cập nhật", icon: RefreshCw, color: "bg-purple-100 text-purple-700" },
  RECAP: { label: "Tổng kết", icon: FileText, color: "bg-emerald-100 text-emerald-700" },
  GUIDELINE: { label: "Hướng dẫn", icon: FileText, color: "bg-slate-100 text-slate-700" },
  REMINDER: { label: "Nhắc nhở", icon: Clock, color: "bg-orange-100 text-orange-700" }
};

const POST_STATUS = {
  PUBLISHED: { label: "Đã đăng", color: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
  DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-700" },
  REJECTED: { label: "Bị từ chối", color: "bg-red-100 text-red-700" }
};

const ITEMS_PER_PAGE = 10;

const PostManagement = ({
  posts = [],
  loading = false,
  user,
  createPost,
  updatePost,
  deletePost,
  onRefresh,
  title = "Quản lý bài đăng",
  eventTitle = "Tất cả sự kiện",
  eligibleEvents = [],
  isFetchingEvents = false,
  fetchEligibleEvents,
  isSystemAdmin = false,
  detailPathPrefix = "/admin/posts"
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Tất cả");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const [postFormData, setPostFormData] = useState({
    title: "",
    content: "",
    postType: "RECAP",
    status: "PUBLISHED",
    eventId: "",
    imageUrls: []
  });

  const resetForm = useCallback(() => {
    setPostFormData({
      title: "",
      content: "",
      postType: "RECAP",
      status: "PUBLISHED",
      eventId: "",
      imageUrls: []
    });
    setEditingPostId(null);
  }, []);

  const canPostForSelectedEvent = useMemo(() => {
    if (!postFormData.eventId) return true;
    const selectedEvent = eligibleEvents.find(e => e.id === postFormData.eventId);
    if (!selectedEvent) return false;
    if (isSystemAdmin) return true;
    const role = selectedEvent.currentUserRole;
    const isInOrganization = user?.organizationId === selectedEvent?.organization?.id || 
                             user?.orgId === selectedEvent?.organization?.id;
    return role?.organizerRole || role?.presented || isInOrganization;
  }, [postFormData.eventId, eligibleEvents, isSystemAdmin, user]);

  const needsApproval = useMemo(() => {
    if (isSystemAdmin) return false;
    const selectedEvent = eligibleEvents.find(e => e.id === postFormData.eventId);
    const isInOrganization = user?.organizationId === selectedEvent?.organization?.id || 
                             user?.orgId === selectedEvent?.organization?.id;
    if (isInOrganization) return false;
    return true; // Lecturers/Presenters/Organizers who are not admins/org members need approval
  }, [isSystemAdmin, user, eligibleEvents, postFormData.eventId]);

  const handleOpenModal = () => {
    resetForm();
    if (fetchEligibleEvents) fetchEligibleEvents();
    setIsCreateModalOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setPostFormData({
      title: post.title || "",
      content: post.content || "",
      postType: post.postType || "RECAP",
      status: post.status || "PUBLISHED",
      eventId: post.eventId || post.event?.id || "",
      imageUrls: post.imageUrls || []
    });
    if (fetchEligibleEvents) fetchEligibleEvents();
    setIsCreateModalOpen(true);
  };

  const handleCreatePost = async (e) => {
    if (e) e.preventDefault();
    if (!postFormData.title || !postFormData.content || !postFormData.eventId) {
      toast.warning("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    if (!canPostForSelectedEvent) {
      toast.error("Bạn không có quyền đăng bài cho sự kiện này.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine final status based on user roles
      // logic: organizations -> PUBLISHED, EventPresenter/EventOrganizer -> PENDING
      const selectedEvent = eligibleEvents.find(e => e.id === postFormData.eventId);
      const isOrganizerOrPresenter = selectedEvent?.currentUserRole?.organizerRole || selectedEvent?.currentUserRole?.presented;
      const isInOrganization = user?.organizationId === selectedEvent?.organization?.id || 
                               user?.orgId === selectedEvent?.organization?.id || 
                               isSystemAdmin;

      let finalStatus = postFormData.status;
      if (finalStatus === "PUBLISHED") {
        if (isInOrganization) {
          finalStatus = "PUBLISHED";
        } else if (isOrganizerOrPresenter) {
          finalStatus = "PENDING";
        }
      }

      const payload = {
        ...postFormData,
        status: finalStatus,
        accountId: user?.id || user?.accountId
      };

      if (editingPostId) {
        await updatePost(editingPostId, payload);
        toast.success("Đã cập nhật bài viết thành công!");
      } else {
        await createPost(payload);
        const successMsg = finalStatus === "PENDING" 
          ? "Bài viết đã được gửi và đang chờ phê duyệt!" 
          : "Đã đăng bài viết thành công!";
        toast.success(successMsg);
      }

      setIsCreateModalOpen(false);
      resetForm();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await eventService.uploadImage(formData);
        if (res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }
      setPostFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls]
      }));
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`);
    } catch (err) {
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setPostFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const filteredPosts = useMemo(() => {
    return (posts || []).filter((post) => {
      // 1. Visibility Check (for non-admins)
      if (!isSystemAdmin) {
        const isAuthor = post.accountId === (user?.id || user?.accountId);
        const eventId = post.eventId || post.event?.id;
        const eventInfo = eligibleEvents.find(e => e.id === eventId);
        
        const hasEventRole = eventInfo?.currentUserRole?.organizerRole || eventInfo?.currentUserRole?.presented;
        const isInEventOrg = user?.organizationId === eventInfo?.organization?.id || 
                             user?.orgId === eventInfo?.organization?.id;
        
        // If not author AND no role/org in the event, hide the post
        if (!isAuthor && !hasEventRole && !isInEventOrg) return false;
      }

      // 2. Search & Tab Filter
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || post.title?.toLowerCase().includes(searchLower) || post.content?.toLowerCase().includes(searchLower);
      
      let matchTab = true;
      switch (activeTab) {
        case "Đã đăng": matchTab = post.status === "PUBLISHED"; break;
        case "Chờ duyệt": matchTab = post.status === "PENDING"; break;
        case "Bản nháp": matchTab = post.status === "DRAFT"; break;
        case "Bị từ chối": matchTab = post.status === "REJECTED"; break;
        default: matchTab = true;
      }

      const matchStatus = statusFilter === "all" || post.status === statusFilter;
      const matchType = typeFilter === "all" || post.postType === typeFilter;

      return matchSearch && matchTab && matchStatus && matchType;
    });
  }, [posts, searchTerm, statusFilter, typeFilter, activeTab, isSystemAdmin, user, eligibleEvents]);

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsSubmitting(true);
    try {
      await deletePost(postToDelete);
      toast.success("Đã xóa bài đăng thành công");
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Không thể xóa bài đăng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => ({
    total: posts?.length || 0,
    published: posts?.filter(p => p.status === "PUBLISHED").length || 0,
    pending: posts?.filter(p => p.status === "PENDING").length || 0,
    draft: posts?.filter(p => p.status === "DRAFT").length || 0,
  }), [posts]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-left">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500">{eventTitle} • {filteredPosts.length} bài viết</p>
          </div>
        </div>

        <button onClick={handleOpenModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-100">
          <Plus size={18} /> Tạo bài đăng mới
        </button>
      </div>

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2">
        {[
          { id: "Tất cả", label: "Tất cả", icon: Newspaper, count: stats.total },
          { id: "Đã đăng", label: "Đã đăng", icon: CheckCircle, count: stats.published },
          { id: "Chờ duyệt", label: "Chờ duyệt", icon: Clock, count: stats.pending },
          { id: "Bản nháp", label: "Bản nháp", icon: FileText, count: stats.draft },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input className="pl-11 pr-4 py-3 w-full border border-gray-100 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Tìm kiếm bài viết..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <select className="border border-gray-100 bg-slate-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 min-w-[160px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Mọi loại bài đăng</option>
          {Object.entries(POST_TYPES).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}
        </select>

        <button onClick={() => { setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all"); setActiveTab("Tất cả"); }} className="px-5 py-3 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-all">Đặt lại</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /><p className="mt-3 text-gray-500 font-medium">Đang tải dữ liệu bài đăng...</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-700">Tiêu đề bài viết</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Nội dung</th>
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
                      <td className="p-4"><p className="font-bold text-slate-800 truncate max-w-[200px]">{post.title}</p></td>
                      <td className="p-4"><p className="text-sm text-gray-600 line-clamp-2 leading-relaxed max-w-[300px]">{post.content}</p></td>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${POST_STATUS[post.status]?.color || "bg-gray-100"}`}>{POST_STATUS[post.status]?.label || post.status}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => navigate(`${detailPathPrefix}/${post.id}`)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-500 hover:text-blue-600 transition-all" title="Xem chi tiết"><Eye size={18} /></button>
                          <button onClick={() => handleEditPost(post)} className="p-2 hover:bg-amber-50 rounded-lg text-gray-500 hover:text-amber-600 transition-all" title="Chỉnh sửa"><Edit2 size={18} /></button>
                          <button onClick={() => { setPostToDelete(post.id); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-all" title="Xóa bài"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="p-20 text-center"><div className="flex flex-col items-center"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4"><Search size={32} /></div><p className="text-gray-500 font-medium">Không tìm thấy bài viết nào</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"><ChevronLeft size={20} /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${currentPage === num ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white border border-gray-200 text-slate-600 hover:border-blue-300 hover:bg-gray-50"}`}>{num}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"><ChevronRight size={20} /></button>
        </div>
      )}

      {/* CREATE POST MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex-1" />
                <h2 className="text-lg font-bold text-slate-800 text-center flex-1">{editingPostId ? "Chỉnh sửa bài viết" : "Tạo bài đăng mới"}</h2>
                <div className="flex-1 flex justify-end">
                  <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><XCircle size={24} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">{user?.fullName?.[0] || user?.username?.[0] || "A"}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user?.fullName || user?.username}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <select value={postFormData.eventId} onChange={(e) => setPostFormData({ ...postFormData, eventId: e.target.value })} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border-none focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors max-w-[150px] truncate">
                        <option value="">Chọn sự kiện...</option>
                        {isFetchingEvents ? (
                          <option disabled>Đang tải...</option>
                        ) : eligibleEvents
                          .filter(ev => {
                            if (isSystemAdmin) return true;
                            const role = ev.currentUserRole;
                            const isInOrg = user?.organizationId === ev.organization?.id || user?.orgId === ev.organization?.id;
                            return role?.organizerRole || role?.presented || isInOrg;
                          })
                          .map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title}</option>
                          ))
                        }
                      </select>
                      <select value={postFormData.postType} onChange={(e) => setPostFormData({ ...postFormData, postType: e.target.value })} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border-none focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors">{Object.entries(POST_TYPES).map(([key, value]) => (<option key={key} value={key}>{value.label.toUpperCase()}</option>))}</select>
                      <select value={postFormData.status} onChange={(e) => setPostFormData({ ...postFormData, status: e.target.value })} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border-none focus:ring-0 cursor-pointer hover:bg-slate-200 transition-colors uppercase">
                        <option value="PUBLISHED">{needsApproval ? "GỬI DUYỆT" : "CÔNG KHAI"}</option>
                        <option value="DRAFT">BẢN NHÁP</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Tiêu đề bài viết..." value={postFormData.title} onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })} className="w-full text-lg font-bold text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 outline-none p-0" />
                  <textarea placeholder="Bạn đang nghĩ gì về sự kiện này?" value={postFormData.content} onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })} className="w-full text-slate-700 placeholder:text-slate-400 border-none focus:ring-0 outline-none p-0 resize-none min-h-[100px] text-base leading-relaxed" />
                  {postFormData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {postFormData.imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-100 shadow-sm">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"><XCircle size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">{isUploading ? <Loader2 className="text-blue-600 animate-spin" size={20} /> : <Plus className="text-slate-400" size={20} />}</div>
                    <p className="text-sm font-bold text-slate-500">{isUploading ? "Đang tải ảnh lên..." : "Thêm ảnh/video"}</p>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <button onClick={handleCreatePost} disabled={isSubmitting || (postFormData.eventId && !canPostForSelectedEvent)} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {editingPostId 
                    ? "Cập nhật bài viết" 
                    : (postFormData.status === "PUBLISHED" 
                        ? (needsApproval ? "Gửi bài duyệt" : "Đăng bài ngay") 
                        : "Lưu bản nháp")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Trash2 size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận xóa?</h3>
              <p className="text-slate-500 text-sm mb-6">Bạn có chắc chắn muốn xóa bài viết này không?</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Hủy bỏ</button>
                <button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg disabled:bg-red-400">{isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Xóa ngay"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostManagement;
