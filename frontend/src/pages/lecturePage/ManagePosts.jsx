import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  Tag,
  Hash,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowsUpFromLine,
  AlertTriangle,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllPosts, deletePost, updatePost } from "../../api/eventPostApi";

const STATUS_LABELS = {
  "": "Tất cả trạng thái",
  Draft: "Bản nháp",
  Published: "Đã đăng",
  Archived: "Lưu trữ",
};

const ManagePosts = () => {
  const navigate = useNavigate();
  const [postData, setPostData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let sortParam = "createdAt,desc";
      if (sortConfig === "oldest") sortParam = "createdAt,asc";
      if (sortConfig === "title") sortParam = "title,asc";

      const res = await getAllPosts({
        searchTerm: searchTerm,
        status: statusFilter || null,
        page: currentPage - 1,
        size: pageSize,
        sort: sortParam,
      });
      setPostData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortConfig, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleConfirmDelete = async () => {
    try {
      await deletePost(selectedPost.id);
      showToast("Xóa bài viết thành công!", "success");
      fetchPosts();
    } catch {
      showToast("Xóa thất bại!", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedPost(null);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      await updatePost(selectedPost.id, selectedPost);
      showToast("Cập nhật thành công!", "success");
      fetchPosts();
      setIsEditModalOpen(false);
    } catch {
      showToast("Cập nhật thất bại!", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative"
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 20 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-4 right-6 z-200 flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-white/90 border-emerald-100 text-emerald-600"
                : "bg-white/90 border-rose-100 text-rose-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-black text-sm tracking-tight">
              {toast.message}
            </span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 p-1 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">
            Quản lý bài viết
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Tìm thấy {postData.totalElements} nội dung
          </p>
        </div>
        <button
          onClick={() => navigate("/lecturer/posts/create")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên bài viết..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-2xl border border-transparent">
              <Filter size={16} className="text-slate-400" />
              <select
                className="bg-transparent border-none text-sm font-bold text-slate-600 py-2.5 outline-none cursor-pointer min-w-40"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-2xl border border-transparent">
              <ArrowsUpFromLine size={16} className="text-slate-400" />
              <select
                className="bg-transparent border-none text-sm font-bold text-slate-600 py-2.5 outline-none cursor-pointer min-w-40"
                value={sortConfig}
                onChange={(e) => {
                  setSortConfig(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="title">Theo tiêu đề</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-100">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-5">Nội dung bài viết</th>
                <th className="px-6 py-5">Phân loại</th>
                <th className="px-6 py-5 text-center">Trạng thái</th>
                <th className="px-6 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {postData.content.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Hash size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-base group-hover:text-blue-600 transition-colors italic line-clamp-1">
                          {post.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                          <Calendar size={12} />
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>Sự kiện: {post.eventName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Tag size={12} className="text-slate-400" />
                      <span className="font-bold text-[10px] uppercase">
                        {post.postType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${post.status === "Published" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : post.status === "Draft" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-100 text-slate-400 border-slate-200"}`}
                    >
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && postData.totalPages > 1 && (
          <div className="p-6 bg-slate-50/30 flex justify-between items-center border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Trang {currentPage} / {postData.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(postData.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all shadow-sm ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(postData.totalPages, p + 1))
                }
                disabled={currentPage === postData.totalPages}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isViewModalOpen && selectedPost && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 italic uppercase">
                  Chi tiết bài viết
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4 text-left">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Tiêu đề
                  </p>
                  <p className="font-bold text-slate-700">
                    {selectedPost.title}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Nội dung
                  </p>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Loại bài viết
                    </p>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedPost.postType}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Trạng thái
                    </p>
                    <span className="text-sm font-bold text-emerald-600">
                      {STATUS_LABELS[selectedPost.status]}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isEditModalOpen && selectedPost && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-8 italic uppercase text-center">
                Chỉnh sửa bài viết
              </h2>
              <form onSubmit={handleUpdatePost} className="space-y-6">
                {/* Sửa Tiêu đề */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">
                    Tiêu đề bài đăng
                  </label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                    value={selectedPost.title}
                    onChange={(e) =>
                      setSelectedPost({
                        ...selectedPost,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Bổ sung Sửa Nội dung (Content) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    rows="5"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-4xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner resize-none"
                    value={selectedPost.content}
                    onChange={(e) =>
                      setSelectedPost({
                        ...selectedPost,
                        content: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Sửa Trạng thái */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">
                    Trạng thái
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-inner"
                    value={selectedPost.status}
                    onChange={(e) =>
                      setSelectedPost({
                        ...selectedPost,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Draft">Bản nháp</option>
                    <option value="Published">Đã đăng</option>
                    <option value="Archived">Lưu trữ</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-3xl font-black text-slate-400 hover:bg-slate-100 uppercase text-[11px] border border-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-3xl font-black bg-blue-600 text-white shadow-xl shadow-blue-100 uppercase text-[11px]"
                  >
                    Cập nhật bài viết
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && selectedPost && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận xóa?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
                Bạn chắc muốn xóa bài viết <br />
                <span className="font-bold text-slate-700 italic">
                  "{selectedPost.title}"
                </span>
                ? <br />
                Không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 border border-slate-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-4 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ManagePosts;
