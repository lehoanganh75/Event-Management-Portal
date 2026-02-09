import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Eye, Heart, MessageSquare, Plus, 
  Search, Edit3, Trash2, MoreHorizontal, 
  Filter, ArrowUpDown, ChevronRight, Share2 
} from "lucide-react";

const ManagePosts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const posts = [
    { 
      id: 1, 
      title: "Hướng dẫn đăng ký tham gia Nghiên cứu khoa học 2026", 
      category: "Thông báo",
      views: 1500, 
      likes: 89, 
      comments: 12,
      date: "08/02/2026", 
      status: "Đã đăng" 
    },
    { 
      id: 2, 
      title: "Danh sách sinh viên nhận học bổng doanh nghiệp quý 1", 
      category: "Tin tức",
      views: 2100, 
      likes: 156, 
      comments: 45,
      date: "01/02/2026", 
      status: "Đã đăng" 
    },
    { 
      id: 3, 
      title: "Lưu ý về quy định trang phục trong kỳ thi sắp tới", 
      category: "Quy định",
      views: 450, 
      likes: 12, 
      comments: 5,
      date: "10/02/2026", 
      status: "Bản nháp" 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý bài viết</h1>
          <p className="text-slate-500 text-sm font-medium">Bạn đã đăng tổng cộng {posts.length} nội dung</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95">
          <Plus size={20} /> Viết bài mới
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên bài viết hoặc danh mục..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">
              <Filter size={14} /> Lọc
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100">
              <ArrowUpDown size={14} /> Sắp xếp
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-250">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung bài viết</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tương tác</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đăng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/30 transition-colors group">
                  {/* Tiêu đề & ID */}
                  <td className="px-6 py-5 max-w-md">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: POST-{post.id}24</p>
                      </div>
                    </div>
                  </td>

                  {/* Danh mục */}
                  <td className="px-6 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold text-[11px] uppercase tracking-tighter">
                      {post.category}
                    </span>
                  </td>

                  {/* Chỉ số tương tác */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4 text-slate-400">
                      <div className="flex flex-col items-center gap-1" title="Lượt xem">
                        <Eye size={14} />
                        <span className="text-[11px] font-black">{post.views >= 1000 ? `${(post.views/1000).toFixed(1)}k` : post.views}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-rose-500" title="Yêu thích">
                        <Heart size={14} fill="currentColor" fillOpacity={0.1} />
                        <span className="text-[11px] font-black">{post.likes}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-blue-500" title="Bình luận">
                        <MessageSquare size={14} />
                        <span className="text-[11px] font-black">{post.comments}</span>
                      </div>
                    </div>
                  </td>

                  {/* Ngày đăng */}
                  <td className="px-6 py-5 text-sm font-semibold text-slate-500">
                    {post.date}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                      post.status === 'Đã đăng' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {post.status}
                    </span>
                  </td>

                  {/* Hành động */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Chỉnh sửa" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button title="Chia sẻ" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Share2 size={18} />
                      </button>
                      <button title="Xóa" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer bảng / Pagination */}
        <div className="p-6 bg-slate-50/30 flex justify-between items-center border-t border-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiển thị 1 - {posts.length} trên {posts.length} bài viết</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Trước</button>
            <button className="px-4 py-2 bg-slate-900 rounded-lg text-xs font-bold text-white shadow-md shadow-slate-200">1</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Sau</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManagePosts;