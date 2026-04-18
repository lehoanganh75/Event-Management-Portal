import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, Users, ArrowLeft, ThumbsUp, MessageCircle, 
  Share2, Globe, MoreHorizontal, Pin, Loader2, 
  Smile, Camera, Send 
} from "lucide-react";
import { motion } from "framer-motion";
import eventService from "../services/eventService";
import Layout from "./layout/Layout";

const EventPostList = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventRes, postsRes] = await Promise.all([
        eventService.getEventById(eventId),
        eventService.getEventPosts(eventId)
      ]);
      setEvent(eventRes.data);
      setPosts(postsRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- COMPONENT RENDER COMMENT (ĐỆ QUY) ---
  const RenderComment = ({ comment, postAuthorId, isReply = false }) => {
    const avatar = !comment.commenter?.avatarUrl || comment.commenter.avatarUrl === "default-avatar-url.png" 
                   ? `https://api.dicebear.com/7.x/initials/svg?seed=${comment.commenter?.fullName}` 
                   : comment.commenter.avatarUrl;

    return (
      <div className={`flex gap-2 ${isReply ? "mt-3" : "mt-4"}`}>
        <img src={avatar} alt="avatar" className={`${isReply ? "w-7 h-7" : "w-8 h-8"} rounded-full flex-shrink-0 object-cover border border-gray-100`} />
        <div className="flex-1">
          <div className="inline-block bg-gray-100 rounded-2xl px-3 py-2 max-w-full shadow-sm">
            <div className="flex items-center gap-1">
              <p className="font-bold text-[12px] hover:underline cursor-pointer text-slate-900">
                {comment.commenter?.fullName || "Người dùng hệ thống"}
              </p>
              {comment.commenter?.id === postAuthorId && (
                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center h-4 font-medium">Tác giả</span>
              )}
            </div>
            <p className="text-[14px] text-gray-800 break-words leading-snug">{comment.content}</p>
          </div>
          <div className="flex gap-4 text-[12px] font-bold text-gray-500 ml-2 mt-1">
            <button className="hover:underline">Thích</button>
            <button className="hover:underline">Phản hồi</button>
            <span className="font-normal text-gray-400">Vừa xong</span>
          </div>

          {comment.replies?.map((reply) => (
            <div key={reply.id} className="ml-1 border-l-2 border-gray-100 pl-3 mt-1">
              <RenderComment comment={reply} postAuthorId={postAuthorId} isReply={true} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- COMPONENT POST CARD ---
  const PostCard = ({ post }) => {
    const countTotalComments = useCallback((comments) => {
      if (!comments || comments.length === 0) return 0;
      return comments.reduce((total, comment) => total + 1 + countTotalComments(comment.replies), 0);
    }, []);
    
    const totalComments = useMemo(() => countTotalComments(post?.comments || []), [post?.comments, countTotalComments]);

    const authorAvatar = !post.author?.avatarUrl || post.author.avatarUrl === "default-avatar-url.png" 
                         ? `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.fullName}` 
                         : post.author.avatarUrl;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
      >
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3">
            <img src={authorAvatar} className="w-10 h-10 rounded-full object-cover border" alt="author" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] text-slate-900">{post.author?.fullName}</h3>
                {post.pinned && <Pin size={14} className="text-blue-600 fill-blue-600" />}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-[13px]">
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleString('vi-VN') : "Vừa xong"}</span>
                <span>•</span> <Globe size={12} />
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><MoreHorizontal size={20} /></button>
        </div>

        <div className="px-4 pb-3">
          <h2 className="text-xl font-bold mb-2 text-slate-800">{post.title}</h2>
          <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">{post.content}</p>
        </div>

        {post.imageUrls?.[0] && (
          <div className="w-full bg-gray-50 border-y border-gray-100">
            <img src={post.imageUrls[0]} alt="Post" className="w-full h-auto max-h-[600px] object-contain mx-auto" />
          </div>
        )}

        <div className="px-4 py-3 flex justify-between items-center text-gray-500 text-[14px] border-b border-gray-50">
          <div className="flex items-center gap-1">
            <div className="bg-blue-500 p-1 rounded-full border border-white">
              <ThumbsUp size={10} className="text-white fill-white" />
            </div>
            <span className="ml-1">{post.viewCount || 0} lượt xem</span>
          </div>
          <div className="text-gray-500">{totalComments} bình luận</div>
        </div>

        <div className="px-2 border-b border-gray-100 py-1 flex">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md text-gray-600 font-semibold text-[14px]"><ThumbsUp size={18} /> Thích</button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md text-gray-600 font-semibold text-[14px]"><MessageCircle size={18} /> Bình luận</button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md text-gray-600 font-semibold text-[14px]"><Share2 size={18} /> Chia sẻ</button>
        </div>

        {/* PHẦN BÌNH LUẬN HIỆN LUÔN */}
        <div className="p-4 bg-white">
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
               <img src={DEFAULT_AVATAR} className="w-full h-full object-cover" alt="me" />
            </div>
            <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 flex items-center gap-2">
              <input placeholder="Viết bình luận công khai..." className="bg-transparent border-none outline-none w-full text-[14px]" />
              <div className="flex gap-2 text-gray-400">
                <Smile size={18} className="cursor-pointer" />
                <Camera size={18} className="cursor-pointer" />
                <Send size={18} className="text-blue-600 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {post.comments?.map((comment) => (
              <RenderComment key={comment.id} comment={comment} postAuthorId={post.author?.id} />
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 pb-12">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white pt-10 pb-20">
          <div className="max-w-5xl mx-auto px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-blue-100 hover:text-white">
              <ArrowLeft size={20} /> <span className="font-medium">Quay lại sự kiện</span>
            </button>
            <h1 className="text-4xl font-bold mb-2">{event?.title}</h1>
            <div className="flex gap-4 text-blue-100">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full"><Calendar size={16} /> {new Date(event?.startTime).toLocaleDateString('vi-VN')}</span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full"><Users size={16} /> {event?.registeredCount} tham gia</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-slate-800">Bảng tin sự kiện</h2>
          </div>
          <div className="space-y-6">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventPostList;