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
  ChevronDown,
  Layers,
  BrainCircuit,
  Megaphone,
  Newspaper,
  RefreshCw,
  Calendar,
  Loader2,
  Eye,
  MoreVertical,
  Send,
  Sparkles,
  Image as ImageIcon
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

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  const handleAIGenerate = async () => {
    if (!postFormData.eventId) {
      toast.warning("Vui lòng chọn sự kiện trước khi sử dụng AI");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const eventRes = await eventService.getEventById(postFormData.eventId);
      const event = eventRes.data;

      // Giới hạn độ dài mô tả để tránh làm quá tải AI
      const shortDesc = event.description?.length > 1000 
        ? event.description.substring(0, 1000) + "..." 
        : event.description;
      
      const eventDetails = `
        Tên sự kiện: ${event.title}
        Mô tả: ${shortDesc}
        Địa điểm: ${event.location}
        Thời gian: ${event.eventDate || "Đang cập nhật"} ${event.eventTime || ""}
        Tổ chức bởi: ${event.organization?.name || "Đang cập nhật"}
      `;

      const aiRes = await eventService.chat.generateMediaPost(eventDetails);
      const rawResult = aiRes.data.result;

      if (rawResult === "ERROR_AI_OVERLOADED") {
        toast.error("Hệ thống AI đang quá tải, vui lòng thử lại sau vài giây.");
        return;
      }

      let result;
      try {
        result = JSON.parse(rawResult);
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Raw response:", rawResult);
        toast.error("AI phản hồi không đúng định dạng. Vui lòng thử lại.");
        return;
      }

      setPostFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        content: result.content || prev.content
      }));

      toast.success("AI đã tạo nội dung bài viết thành công!");
    } catch (err) {
      console.error("AI Generation Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi kết nối";
      toast.error(`Không thể kết nối với dịch vụ AI: ${errorMsg}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

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

    // Được đăng bài nếu là Admin, hoặc có vai trò (BTC, Diễn giả, Người tạo), hoặc thuộc tổ chức
    return isSystemAdmin || role?.organizerRole || role?.presented || role?.creator || isInOrganization;
  }, [postFormData.eventId, eligibleEvents, isSystemAdmin, user]);

  const needsApproval = useMemo(() => {
    if (isSystemAdmin) return false;
    const selectedEvent = eligibleEvents.find(e => e.id === postFormData.eventId);
    if (!selectedEvent) return true;

    const role = selectedEvent.currentUserRole;
    const isInOrganization = user?.organizationId === selectedEvent?.organization?.id ||
      user?.orgId === selectedEvent?.organization?.id;

    // KHÔNG cần duyệt nếu: Là Admin hệ thống, Hoặc thuộc Tổ chức sở hữu, Hoặc là Ban tổ chức, Hoặc là Người tạo
    if (isInOrganization || role?.organizerRole || role?.creator) return false;

    // Các vai trò khác (như Diễn giả) thì phải duyệt
    return true;
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
    if (!postFormData.title || !postFormData.content) {
      toast.warning("Vui lòng điền tiêu đề và nội dung bài viết");
      return;
    }
    if (!postFormData.eventId) {
      toast.warning("Vui lòng chọn một sự kiện để gắn bài viết");
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
        const authorId = post.author?.id || post.createdByAccountId || post.accountId;
        const isAuthor = authorId === (user?.id || user?.accountId);
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
                  <th className="p-4 text-left font-semibold text-slate-700">Người đăng</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Tiêu đề bài viết</th>
                  <th className="p-4 text-left font-semibold text-slate-700">Sự kiện</th>
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
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0">
                            <img
                              src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.fullName || "User")}&background=random&color=fff`}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-slate-700 whitespace-nowrap">
                            {post.author?.fullName || "Người dùng"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4"><p className="font-bold text-slate-800 truncate max-w-[200px]">{post.title}</p></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0 shadow-sm">
                            <img 
                              src={post.eventImageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200"} 
                              alt="Event" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200" }}
                            />
                          </div>
                          <p className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 truncate max-w-[120px]">
                            {post.eventTitle || "Sự kiện khác"}
                          </p>
                        </div>
                      </td>
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
                  <tr><td colSpan={8} className="p-20 text-center"><div className="flex flex-col items-center"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4"><Search size={32} /></div><p className="text-gray-500 font-medium">Không tìm thấy bài viết nào</p></div></td></tr>
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
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white"
            >
              {/* MODAL HEADER */}
              <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      {editingPostId ? "Chỉnh sửa bài viết" : "Tạo bài đăng mới"}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Truyền thông sự kiện</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-800 hover:shadow-md transition-all border border-slate-100"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">
                {/* USER & TARGET SECTION */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl shadow-blue-100 shrink-0 border-2 border-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                        {user?.fullName?.[0] || user?.username?.[0] || "A"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{user?.fullName || user?.username}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="relative group">
                          <div 
                            onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                            className="flex items-center gap-2 pl-8 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none cursor-pointer min-w-[200px] hover:bg-white transition-all relative"
                          >
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                            <span className="truncate">
                              {postFormData.eventId 
                                ? eligibleEvents.find(e => e.id === postFormData.eventId)?.title 
                                : "Tìm chọn sự kiện..."}
                            </span>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>

                          <AnimatePresence>
                            {isEventDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-[10]" onClick={() => setIsEventDropdownOpen(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[11] overflow-hidden"
                                >
                                  <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                      <input
                                        autoFocus
                                        type="text"
                                        placeholder="Gõ để tìm nhanh..."
                                        value={eventSearchTerm}
                                        onChange={(e) => setEventSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                      />
                                    </div>
                                  </div>
                                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                                    {eligibleEvents
                                      .filter(ev => {
                                        const matchesSearch = ev.title.toLowerCase().includes(eventSearchTerm.toLowerCase());
                                        if (isSystemAdmin) return matchesSearch;
                                        const role = ev.currentUserRole;
                                        const isInOrg = user?.organizationId === ev.organization?.id || user?.orgId === ev.organization?.id;
                                        return matchesSearch && (isSystemAdmin || role?.organizerRole || role?.presented || role?.creator || isInOrg);
                                      })
                                      .map(ev => (
                                        <button
                                          key={ev.id}
                                          type="button"
                                          onClick={() => {
                                            setPostFormData({ ...postFormData, eventId: ev.id });
                                            setIsEventDropdownOpen(false);
                                            setEventSearchTerm("");
                                          }}
                                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                                            postFormData.eventId === ev.id 
                                              ? "bg-blue-50 text-blue-600" 
                                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                          }`}
                                        >
                                          <span className="truncate flex-1">{ev.title}</span>
                                          {postFormData.eventId === ev.id && <CheckCircle size={12} />}
                                        </button>
                                      ))
                                    }
                                    {eligibleEvents.filter(ev => ev.title.toLowerCase().includes(eventSearchTerm.toLowerCase())).length === 0 && (
                                      <div className="p-4 text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Không tìm thấy sự kiện</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="relative group">
                          <select 
                            value={postFormData.postType} 
                            onChange={(e) => setPostFormData({ ...postFormData, postType: e.target.value })} 
                            className="appearance-none pl-8 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer uppercase"
                          >
                            {Object.entries(POST_TYPES).map(([key, value]) => (
                              <option key={key} value={key}>{value.label.toUpperCase()}</option>
                            ))}
                          </select>
                          <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:translate-y-[-40%] transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* AI ASSISTANT PANEL */}
                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-[2rem] p-5 border border-blue-100/50 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest leading-none mb-1">AI Assistant</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Hỗ trợ lên nội dung bài viết chuyên nghiệp</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">


                          <button
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={isGeneratingAI || !postFormData.eventId}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
                          >
                            {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {isGeneratingAI ? "Đang tạo..." : "VIẾT BÀI NGAY"}
                          </button>
                        </div>
                      </div>
                      
                      {isGeneratingAI && (
                        <div className="mt-4 bg-white/60 rounded-2xl p-4 flex items-center gap-3 animate-pulse border border-white">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                            <BrainCircuit size={16} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="h-2 bg-indigo-200 rounded-full w-3/4" />
                            <div className="h-2 bg-indigo-100 rounded-full w-1/2" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* POST CONTENT SECTION */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Tiêu đề bài viết</label>
                    <input 
                      type="text" 
                      placeholder="Nhập tiêu đề thu hút người đọc..." 
                      value={postFormData.title} 
                      onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })} 
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 text-slate-800 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-300 transition-all shadow-sm" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Nội dung chi tiết</label>
                    <textarea 
                      placeholder="Chia sẻ những khoảnh khắc tuyệt vời của sự kiện..." 
                      value={postFormData.content} 
                      onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })} 
                      className="w-full px-6 py-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-300 transition-all shadow-sm min-h-[180px] resize-none leading-relaxed" 
                    />
                  </div>

                  {/* IMAGES DISPLAY */}
                  {postFormData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {postFormData.imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden group border-2 border-white shadow-lg ring-1 ring-slate-100">
                          <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => removeImage(index)} 
                              className="p-2 bg-white/20 hover:bg-rose-500 text-white rounded-xl backdrop-blur-md transition-all transform translate-y-4 group-hover:translate-y-0"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FILE UPLOAD */}
                  <label className="block border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group shadow-inner bg-slate-50/50">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all shadow-sm border border-slate-100">
                      {isUploading ? <Loader2 className="text-blue-600 animate-spin" size={24} /> : <ImageIcon className="text-slate-400 group-hover:text-blue-500" size={24} />}
                    </div>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{isUploading ? "Đang tải ảnh lên..." : "Đính kèm hình ảnh"}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Chọn tối đa 10 ảnh định dạng JPG, PNG</p>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="hidden sm:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thiết lập trạng thái:</p>
                  <select 
                    value={postFormData.status} 
                    onChange={(e) => setPostFormData({ ...postFormData, status: e.target.value })} 
                    className="bg-transparent border-none focus:ring-0 text-xs font-black text-slate-600 cursor-pointer uppercase p-0"
                  >
                    <option value="PUBLISHED">{needsApproval ? "YÊU CẦU DUYỆT" : "CÔNG KHAI NGAY"}</option>
                    <option value="DRAFT">BẢN NHÁP</option>
                  </select>
                </div>

                <button 
                  onClick={handleCreatePost} 
                  disabled={isSubmitting || (postFormData.eventId && !canPostForSelectedEvent)} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:shadow-none"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
