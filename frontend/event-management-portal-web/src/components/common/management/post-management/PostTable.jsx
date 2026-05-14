import React from "react";
import {
  Loader2,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";

const PostTable = ({
  posts,
  loading,
  postTypes,
  postStatus,
  navigate,
  detailPathPrefix,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
        <Loader2 className="animate-spin mx-auto text-[#1E40AF]" size={36} />
        <p className="mt-3 text-sm text-slate-500">
          Đang tải dữ liệu bài đăng...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[
                "Người đăng",
                "Tiêu đề",
                "Sự kiện",
                "Nội dung",
                "Loại",
                "Ngày tạo",
                "Trạng thái",
                "Hành động",
              ].map((head) => (
                <th
                  key={head}
                  className={`px-4 py-3 text-sm font-semibold text-slate-600 whitespace-nowrap ${head === "Hành động" ? "text-center" : "text-left"
                    }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {posts.length > 0 ? (
              posts.map((post) => {
                const TypeIcon =
                  postTypes[post.postType]?.icon || FileText;

                return (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Author */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={
                              post.author?.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                post.author?.fullName || "User"
                              )}&background=1E40AF&color=fff`
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <span className="font-medium text-slate-700 whitespace-nowrap">
                          {post.author?.fullName || "Người dùng"}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {post.title}
                      </p>
                    </td>

                    {/* Event */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={
                              post.eventImageUrl ||
                              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200"
                            }
                            alt="Event"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200";
                            }}
                          />
                        </div>

                        <span className="max-w-[140px] truncate px-2 py-1 rounded-lg bg-blue-50 text-[#1E40AF] text-xs font-medium border border-blue-100">
                          {post.eventTitle || "Sự kiện khác"}
                        </span>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed max-w-[280px]">
                        {post.content}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${postTypes[post.postType]?.color ||
                          "bg-slate-100 text-slate-600"
                          }`}
                      >
                        <TypeIcon size={12} />
                        {postTypes[post.postType]?.label || post.postType}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(
                            post.createdAt || Date.now()
                          ).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(
                            post.createdAt || Date.now()
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${postStatus[post.status]?.color ||
                          "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {postStatus[post.status]?.label || post.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`${detailPathPrefix}/${post.id}`)
                          }
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-[#1E40AF] transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => onEdit(post)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={17} />
                        </button>

                        <button
                          onClick={() => onDelete(post.id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Xóa bài"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                      <Search size={28} />
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                      Không tìm thấy bài viết nào
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTable;