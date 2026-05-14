import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import eventService from "../../../services/eventService";

// Sub-components
import PostStats from "./post-management/PostStats";
import PostFilters from "./post-management/PostFilters";
import PostTable from "./post-management/PostTable";
import PostCreateModal from "./post-management/PostCreateModal";
import PostDeleteModal from "./post-management/PostDeleteModal";
import Pagination from "./post-management/Pagination";

// Constants
import { Megaphone, Newspaper, RefreshCw, FileText, Clock } from "lucide-react";

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

  const handleAIGenerate = async () => {
    if (!postFormData.eventId) {
      toast.warning("Vui lòng chọn sự kiện trước khi sử dụng AI");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const eventRes = await eventService.getEventById(postFormData.eventId);
      const event = eventRes.data;

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
      const errorMsg = err.response?.data?.message || err.message || "Lỗi kết nối";
      toast.error(`Không thể kết nối với dịch vụ AI: ${errorMsg}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const canPostForSelectedEvent = useMemo(() => {
    if (!postFormData.eventId) return true;
    const selectedEvent = eligibleEvents.find(e => e.id === postFormData.eventId);
    if (!selectedEvent) return false;
    if (isSystemAdmin) return true;
    const role = selectedEvent.currentUserRole;
    const isInOrganization = user?.organizationId === selectedEvent?.organization?.id ||
      user?.orgId === selectedEvent?.organization?.id;

    return isSystemAdmin || role?.organizerRole || role?.presented || role?.creator || isInOrganization;
  }, [postFormData.eventId, eligibleEvents, isSystemAdmin, user]);

  const needsApproval = useMemo(() => {
    if (isSystemAdmin) return false;
    const selectedEvent = eligibleEvents.find(e => e.id === postFormData.eventId);
    if (!selectedEvent) return true;

    const role = selectedEvent.currentUserRole;
    const isInOrganization = user?.organizationId === selectedEvent?.organization?.id ||
      user?.orgId === selectedEvent?.organization?.id;

    if (isInOrganization || role?.organizerRole || role?.creator) return false;
    return true;
  }, [isSystemAdmin, user, eligibleEvents, postFormData.eventId]);

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
      if (!isSystemAdmin) {
        const authorId = post.author?.id || post.createdByAccountId || post.accountId;
        const isAuthor = authorId === (user?.id || user?.accountId);
        const eventId = post.eventId || post.event?.id;
        const eventInfo = eligibleEvents.find(e => e.id === eventId);

        const hasEventRole = eventInfo?.currentUserRole?.organizerRole || eventInfo?.currentUserRole?.presented;
        const isInEventOrg = user?.organizationId === eventInfo?.organization?.id ||
          user?.orgId === eventInfo?.organization?.id;

        if (!isAuthor && !hasEventRole && !isInEventOrg) return false;
      }

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

  const stats = useMemo(() => ({
    total: posts?.length || 0,
    published: posts?.filter(p => p.status === "PUBLISHED").length || 0,
    pending: posts?.filter(p => p.status === "PENDING").length || 0,
    draft: posts?.filter(p => p.status === "DRAFT").length || 0,
  }), [posts]);

  const paginatedPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-left">
      <PostFilters 
        title={title}
        eventTitle={eventTitle}
        count={filteredPosts.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        onReset={() => { setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all"); setActiveTab("Tất cả"); }}
        onOpenCreateModal={() => { resetForm(); if (fetchEligibleEvents) fetchEligibleEvents(); setIsCreateModalOpen(true); }}
        postTypes={POST_TYPES}
      />

      <PostStats 
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
      />

      <PostTable 
        posts={paginatedPosts}
        loading={loading}
        postTypes={POST_TYPES}
        postStatus={POST_STATUS}
        navigate={navigate}
        detailPathPrefix={detailPathPrefix}
        onEdit={(post) => {
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
        }}
        onDelete={(id) => { setPostToDelete(id); setIsDeleteModalOpen(true); }}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <PostCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        user={user}
        postFormData={postFormData}
        setPostFormData={setPostFormData}
        editingPostId={editingPostId}
        eligibleEvents={eligibleEvents}
        isSystemAdmin={isSystemAdmin}
        isSubmitting={isSubmitting}
        handleSubmit={handleCreatePost}
        isGeneratingAI={isGeneratingAI}
        handleAIGenerate={handleAIGenerate}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        isEventDropdownOpen={isEventDropdownOpen}
        setIsEventDropdownOpen={setIsEventDropdownOpen}
        eventSearchTerm={eventSearchTerm}
        setEventSearchTerm={setEventSearchTerm}
        needsApproval={needsApproval}
        canPostForSelectedEvent={canPostForSelectedEvent}
        postTypes={POST_TYPES}
        resetForm={resetForm}
      />

      <PostDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
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
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PostManagement;
