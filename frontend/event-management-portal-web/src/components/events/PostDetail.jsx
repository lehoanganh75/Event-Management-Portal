import React, { useCallback, useEffect, useMemo, useState } from "react";
import { 
  MoreHorizontal, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Globe, 
  Pin,
  Send,
  Camera,
  Smile,
  Loader2,
} from "lucide-react";
import eventService from "../../services/eventService";
import { useParams } from "react-router-dom";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ảnh đại diện mặc định nếu service identity trả về "default-avatar-url.png" hoặc null
  const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky";

  const loadPost = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventService.getPostById(id);
      setPost(response.data);
    } catch (err) {
      setError("Không thể tải chi tiết bài đăng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadPost();
  }, [id, loadPost]);

  // Tính tổng số bình luận (bao gồm cả replies) bằng đệ quy
  const countTotalComments = useCallback((comments) => {
    if (!comments || comments.length === 0) return 0;
    return comments.reduce((total, comment) => {
      return total + 1 + countTotalComments(comment.replies);
    }, 0);
  }, []);

  const totalComments = useMemo(() => {
    return countTotalComments(post?.comments || []);
  }, [post?.comments, countTotalComments]);

  // Helper component để render comment và replies
  const RenderComment = ({ comment, isReply = false }) => {
    const avatar = !comment.commenter?.avatarUrl || comment.commenter.avatarUrl === "default-avatar-url.png" 
                   ? `https://api.dicebear.com/7.x/initials/svg?seed=${comment.commenter?.fullName}` 
                   : comment.commenter.avatarUrl;

    return (
      <div className={`flex gap-2 ${isReply ? "mt-3" : "mt-4"}`}>
        <img 
          src={avatar} 
          alt="avatar" 
          className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full flex-shrink-0 object-cover border border-gray-100`} 
        />
        <div className="flex-1">
          <div className="inline-block bg-gray-100 rounded-2xl px-3 py-2 max-w-full shadow-sm">
            <div className="flex items-center gap-1">
              <p className="font-bold text-[12px] hover:underline cursor-pointer text-slate-900">
                {comment.commenter?.fullName || "Người dùng hệ thống"}
              </p>
              {/* Check nếu người comment là tác giả bài viết */}
              {comment.commenter?.id === post?.author?.id && (
                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center h-4 font-medium">Tác giả</span>
              )}
            </div>
            <p className="text-[14px] text-gray-800 break-words leading-snug">{comment.content}</p>
          </div>
          <div className="flex gap-4 text-[12px] font-bold text-gray-500 ml-2 mt-1">
            <button className="hover:underline">Thích</button>
            <button className="hover:underline">Phản hồi</button>
            <span className="font-normal text-gray-400">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('vi-VN') : "Vừa xong"}
            </span>
          </div>

          {/* REPLIES ĐỆ QUY */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-1 border-l-2 border-gray-100 pl-3 mt-1">
              {comment.replies.map((reply) => (
                <RenderComment key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 bg-gray-50">
      <Loader2 className="animate-spin mb-2 text-blue-600" size={40} />
      <p className="font-medium">Đang tải nội dung bài viết...</p>
    </div>
  );

  if (error || !post) return (
    <div className="text-center py-20 text-red-500 bg-gray-50 min-h-screen px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm inline-block max-w-md">
        <p className="text-lg font-semibold">{error || "Không tìm thấy bài viết"}</p>
        <button onClick={loadPost} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">Thử lại</button>
      </div>
    </div>
  );

  const authorAvatar = !post.author.avatarUrl || post.author.avatarUrl === "default-avatar-url.png" 
                       ? DEFAULT_AVATAR 
                       : post.author.avatarUrl;

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6 flex justify-center">
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
        
        {/* HEADER BÀI VIẾT */}
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3">
            <img 
              src={authorAvatar} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" 
              alt="author"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] hover:underline cursor-pointer text-slate-900">
                  {post.author.fullName}
                </h3>
                {post.pinned && <Pin size={14} className="text-blue-600 fill-blue-600" />}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-[13px]">
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleString('vi-VN') : "Vừa xong"}</span>
                <span>•</span>
                <Globe size={12} />
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* NỘI DUNG VĂN BẢN */}
        <div className="px-4 pb-3">
          <h2 className="text-xl font-bold mb-2 text-slate-800 leading-tight">{post.title}</h2>
          <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* HÌNH ẢNH BÀI VIẾT */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="w-full bg-gray-50 border-y border-gray-100 overflow-hidden">
            <img 
              src={post.imageUrls[0]} 
              alt="Post media" 
              className="w-full h-auto max-h-[600px] object-contain mx-auto transition-all hover:scale-[1.01] cursor-zoom-in"
            />
          </div>
        )}

        {/* THỐNG KÊ TƯƠNG TÁC */}
        <div className="px-4 py-3 flex justify-between items-center text-gray-500 text-[14px] border-b border-gray-50">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="bg-blue-500 p-1 rounded-full border border-white">
                <ThumbsUp size={10} className="text-white fill-white" />
              </div>
            </div>
            <span className="ml-1">{post.viewCount} lượt xem</span>
          </div>
          <div className="cursor-pointer hover:underline">
             {totalComments} bình luận
          </div>
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG */}
        <div className="px-2 border-b border-gray-200 py-1 flex">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-all text-gray-600 font-semibold text-[14px]">
            <ThumbsUp size={18} /> Thích
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-all text-gray-600 font-semibold text-[14px]">
            <MessageCircle size={18} /> Bình luận
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-all text-gray-600 font-semibold text-[14px]">
            <Share2 size={18} /> Chia sẻ
          </button>
        </div>

        {/* PHẦN BÌNH LUẬN */}
        <div className="p-4">
          {post.allowComments ? (
            <>
              {/* Ô Nhập Bình Luận */}
              <div className="flex gap-2 mb-6">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden shadow-inner">
                   <img src={authorAvatar} className="w-full h-full object-cover" alt="me" />
                </div>
                <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 flex items-center gap-2 border border-transparent focus-within:border-gray-200 transition-all">
                  <input 
                    placeholder="Viết bình luận công khai..." 
                    className="bg-transparent border-none outline-none w-full text-[14px] placeholder:text-gray-500"
                  />
                  <div className="flex gap-2 text-gray-400">
                    <Smile size={18} className="cursor-pointer hover:text-gray-600" />
                    <Camera size={18} className="cursor-pointer hover:text-gray-600" />
                    <Send size={18} className="text-blue-600 cursor-pointer hover:scale-110 active:scale-95 transition-all" />
                  </div>
                </div>
              </div>

              {/* DANH SÁCH BÌNH LUẬN */}
              <div className="space-y-1">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <RenderComment key={comment.id} comment={comment} />
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-4 italic">Hãy là người đầu tiên bình luận về bài viết này.</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl py-3 border border-dashed border-gray-200">
              <p className="text-center text-gray-500 text-sm">Tính năng bình luận đã bị tắt cho bài viết này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;