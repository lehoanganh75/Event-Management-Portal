import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  X,
  Calendar,
  ChevronDown,
  Search,
  Layers,
  Sparkles,
  Loader2,
  BrainCircuit,
  Trash2,
  Image as ImageIcon,
  Send,
  CheckCircle,
} from "lucide-react";

const PostCreateModal = ({
  isOpen,
  onClose,
  user,
  postFormData,
  setPostFormData,
  editingPostId,
  eligibleEvents,
  isSystemAdmin,
  isSubmitting,
  handleSubmit,
  isGeneratingAI,
  handleAIGenerate,
  isUploading,
  handleFileChange,
  removeImage,
  isEventDropdownOpen,
  setIsEventDropdownOpen,
  eventSearchTerm,
  setEventSearchTerm,
  needsApproval,
  canPostForSelectedEvent,
  postTypes,
  resetForm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editingPostId ? "Chỉnh sửa bài viết" : "Tạo bài đăng mới"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Truyền thông sự kiện
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
              >
                <X size={18} className="mx-auto" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* User + Selectors */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1E40AF] text-white flex items-center justify-center font-semibold text-lg">
                      {user?.fullName?.[0] || user?.username?.[0] || "A"}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.fullName || user?.username}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {/* Event Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setIsEventDropdownOpen(!isEventDropdownOpen)
                        }
                        className="h-10 min-w-[220px] flex items-center gap-2 px-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Calendar size={15} className="text-[#1E40AF]" />

                        <span className="truncate flex-1 text-left">
                          {postFormData.eventId
                            ? eligibleEvents.find(
                              (e) => e.id === postFormData.eventId
                            )?.title
                            : "Tìm chọn sự kiện..."}
                        </span>

                        <ChevronDown size={15} className="text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {isEventDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-[10]"
                              onClick={() => setIsEventDropdownOpen(false)}
                            />

                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-lg z-[11] overflow-hidden"
                            >
                              <div className="p-3 border-b border-slate-100">
                                <div className="relative">
                                  <Search
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                  />
                                  <input
                                    autoFocus
                                    type="text"
                                    placeholder="Gõ để tìm nhanh..."
                                    value={eventSearchTerm}
                                    onChange={(e) =>
                                      setEventSearchTerm(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1E40AF]"
                                  />
                                </div>
                              </div>

                              <div className="max-h-60 overflow-y-auto p-2">
                                {eligibleEvents
                                  .filter((ev) => {
                                    const matchesSearch = ev.title
                                      .toLowerCase()
                                      .includes(eventSearchTerm.toLowerCase());

                                    if (isSystemAdmin) return matchesSearch;

                                    const role = ev.currentUserRole;
                                    const isInOrg =
                                      user?.organizationId ===
                                      ev.organization?.id ||
                                      user?.orgId === ev.organization?.id;

                                    return (
                                      matchesSearch &&
                                      (isSystemAdmin ||
                                        role?.organizerRole ||
                                        role?.presented ||
                                        role?.creator ||
                                        isInOrg)
                                    );
                                  })
                                  .map((ev) => (
                                    <button
                                      key={ev.id}
                                      type="button"
                                      onClick={() => {
                                        setPostFormData({
                                          ...postFormData,
                                          eventId: ev.id,
                                        });
                                        setIsEventDropdownOpen(false);
                                        setEventSearchTerm("");
                                      }}
                                      className={`w-full px-3 py-2.5 rounded-xl text-sm flex items-center justify-between gap-2 transition ${postFormData.eventId === ev.id
                                          ? "bg-blue-50 text-[#1E40AF]"
                                          : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                      <span className="truncate text-left">
                                        {ev.title}
                                      </span>

                                      {postFormData.eventId === ev.id && (
                                        <CheckCircle size={14} />
                                      )}
                                    </button>
                                  ))}

                                {eligibleEvents.filter((ev) =>
                                  ev.title
                                    .toLowerCase()
                                    .includes(eventSearchTerm.toLowerCase())
                                ).length === 0 && (
                                    <div className="p-4 text-center text-sm text-slate-400">
                                      Không tìm thấy sự kiện
                                    </div>
                                  )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Post Type */}
                    <div className="relative">
                      <select
                        value={postFormData.postType}
                        onChange={(e) =>
                          setPostFormData({
                            ...postFormData,
                            postType: e.target.value,
                          })
                        }
                        className="h-10 appearance-none pl-9 pr-9 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-[#1E40AF] transition"
                      >
                        {Object.entries(postTypes).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.label}
                          </option>
                        ))}
                      </select>

                      <Layers
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500"
                      />
                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Box */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#1E40AF] flex items-center justify-center border border-blue-100">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        AI Assistant
                      </h4>
                      <p className="text-xs text-slate-500">
                        Hỗ trợ lên nội dung bài viết nhanh hơn
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGeneratingAI || !postFormData.eventId}
                    className="h-10 px-4 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-800 disabled:bg-slate-300 transition flex items-center justify-center gap-2"
                  >
                    {isGeneratingAI ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Sparkles size={15} />
                    )}
                    {isGeneratingAI ? "Đang tạo..." : "Viết bài ngay"}
                  </button>
                </div>

                {isGeneratingAI && (
                  <div className="mt-4 rounded-xl bg-white border border-blue-100 p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1E40AF]">
                      <BrainCircuit size={16} />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-blue-100 rounded-full w-3/4" />
                      <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tiêu đề bài viết
                  </label>

                  <input
                    type="text"
                    placeholder="Nhập tiêu đề thu hút người đọc..."
                    value={postFormData.title}
                    onChange={(e) =>
                      setPostFormData({
                        ...postFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#1E40AF] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nội dung chi tiết
                  </label>

                  <textarea
                    placeholder="Chia sẻ nội dung bài viết..."
                    value={postFormData.content}
                    onChange={(e) =>
                      setPostFormData({
                        ...postFormData,
                        content: e.target.value,
                      })
                    }
                    className="w-full min-h-[170px] px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none resize-none focus:border-[#1E40AF] transition leading-relaxed"
                  />
                </div>

                {/* Images */}
                {postFormData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {postFormData.imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                      >
                        <img
                          src={url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={() => removeImage(index)}
                            className="w-9 h-9 rounded-lg bg-white text-red-500 flex items-center justify-center hover:bg-red-50 transition"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload */}
                <label className="block border border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />

                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-[#1E40AF]">
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <ImageIcon size={22} />
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    {isUploading ? "Đang tải ảnh lên..." : "Đính kèm hình ảnh"}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Chọn tối đa 10 ảnh định dạng JPG, PNG
                  </p>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Thiết lập trạng thái
                </p>

                <select
                  value={postFormData.status}
                  onChange={(e) =>
                    setPostFormData({
                      ...postFormData,
                      status: e.target.value,
                    })
                  }
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1E40AF]"
                >
                  <option value="PUBLISHED">
                    {needsApproval ? "Yêu cầu duyệt" : "Công khai ngay"}
                  </option>
                  <option value="DRAFT">Bản nháp</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (postFormData.eventId && !canPostForSelectedEvent)
                }
                className="h-11 px-6 rounded-xl bg-[#1E40AF] text-white text-sm font-semibold hover:bg-blue-800 disabled:bg-slate-300 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}

                {editingPostId
                  ? "Cập nhật bài viết"
                  : postFormData.status === "PUBLISHED"
                    ? needsApproval
                      ? "Gửi bài duyệt"
                      : "Đăng bài ngay"
                    : "Lưu bản nháp"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostCreateModal;
