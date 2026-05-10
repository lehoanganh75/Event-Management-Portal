import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  XCircle,
  X,
  Undo2,
  ArrowLeft,
  Eye,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../ConfirmModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import eventService from "../../../services/eventService";
import { createStompClient } from "../../../utils/socket";
import { formatRelativeTime } from "../../../utils/dateUtils";

const EMOJIS = ["❤️", "👍", "🔥", "😊", "🎉", "👏", "😮", "😢", "🙌", "✨", "🙏", "💯", "🤣", "😍", "💡"];
const REACTION_LABELS = {
  "👍": "Thích",
  "❤️": "Yêu thích",
  "🔥": "Tuyệt vời",
  "😊": "Hạnh phúc",
  "🎉": "Chúc mừng",
  "👏": "Tán thưởng",
  "😮": "Ngạc nhiên",
  "😢": "Chia buồn",
  "🤣": "Haha",
  "😍": "Yêu thích",
  "🙌": "Tuyệt quá",
  "✨": "Lấp lánh",
  "🙏": "Trân trọng",
  "💯": "Tuyệt đối",
  "💡": "Hữu ích"
};
const STICKERS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZHV5ZnhueGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGpxo784G6d6U/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZHV5ZnhueGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l41lTfuxm5z1h9kZy/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZHV5ZnhueGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKVUn7iM8FMEU24/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZHV5ZnhueGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/l41lJ9mU6mFqY6oIE/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJtZHV5ZnhueGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6ZnhxeGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/3o7TKMGpxo784G6d6U/giphy.gif",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Happy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Cool",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Love",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Haha",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Wow"
];
const REACTION_COLORS = {
  "👍": "text-blue-600",
  "❤️": "text-rose-600",
  "🔥": "text-orange-500",
  "😊": "text-amber-500",
  "🎉": "text-purple-600",
  "👏": "text-yellow-600",
  "😮": "text-cyan-600",
  "😢": "text-indigo-600",
  "🤣": "text-yellow-500",
  "😍": "text-pink-600",
  "🙌": "text-sky-600",
  "✨": "text-amber-400",
  "🙏": "text-teal-600",
  "💯": "text-red-600",
  "💡": "text-amber-600"
};
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky";

const countTotalComments = (comments) => {
  if (!comments || comments.length === 0) return 0;
  return comments.reduce((total, comment) => total + 1 + countTotalComments(comment.replies), 0);
};

const RenderComment = ({
  comment,
  post,
  isReply = false,
  activeReplyId,
  setActiveReplyId,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  handleReactComment,
  isSubmittingComment,
    currentUser,
    handleDeleteComment,
  }) => {
   const [showLocalEmojiPicker, setShowLocalEmojiPicker] = useState(false);
   const [showOptions, setShowOptions] = useState(false);
   const optionsRef = useRef(null);
   const [showAllReplies, setShowAllReplies] = useState(false);
   const localEmojiPickerRef = useRef(null);
  const replyTextareaRef = useRef(null);
  const prevRepliesCount = useRef(countTotalComments(comment.replies));

  useEffect(() => {
    const currentCount = countTotalComments(comment.replies);
    if (currentCount > prevRepliesCount.current) {
      setShowAllReplies(true);
    }
    prevRepliesCount.current = currentCount;
  }, [comment.replies]);

  useEffect(() => {
    if (replyTextareaRef.current && activeReplyId === comment.id) {
      replyTextareaRef.current.style.height = 'inherit';
      replyTextareaRef.current.style.height = `${replyTextareaRef.current.scrollHeight}px`;
    }
  }, [replyContent, activeReplyId, comment.id]);

  const author = comment.commenter || comment.author;
  const avatar = author?.avatarUrl && author.avatarUrl !== "default-avatar-url.png"
    ? author.avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${author?.fullName || 'User'}`;

  useEffect(() => {
     const handleClickOutside = (event) => {
       if (localEmojiPickerRef.current && !localEmojiPickerRef.current.contains(event.target)) {
         setShowLocalEmojiPicker(false);
       }
       if (optionsRef.current && !optionsRef.current.contains(event.target)) {
         setShowOptions(false);
       }
     };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addEmojiToReply = (emoji) => {
    setReplyContent(prev => prev + emoji);
    setShowLocalEmojiPicker(false);
  };

  const reactions = comment.reactions || {};
  const reactionList = Object.values(reactions);
  const userCommentReaction = currentUser ? reactions[currentUser.id] : null;
  const hasLikedComment = !!userCommentReaction;

  return (
    <div className={`flex gap-3 relative ${isReply ? "mt-3 ml-10" : "mt-5"}`}>
      {/* Visual connector line for replies */}
      {isReply && (
        <div className="absolute -left-6 top-[-20px] bottom-1/2 w-6 border-l-2 border-b-2 border-slate-200 rounded-bl-xl" />
      )}
      <img src={avatar} alt="avatar" className={`${isReply ? "w-7 h-7" : "w-8 h-8"} rounded-full flex-shrink-0 object-cover border-2 border-white shadow-sm z-10`} />
       <div className="flex-1 min-w-0">
         <div className="group/comment relative inline-block max-w-full">
           <div className="inline-block bg-slate-100 rounded-2xl px-4 py-2 shadow-sm relative">
             <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-[13px] text-slate-900">{author?.fullName || "Người dùng"}</p>
            {String(author?.id) === String(post?.author?.id) && (
              <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Tác giả</span>
            )}
          </div>
          {comment.content && <p className="text-[14px] text-slate-800 break-all leading-relaxed">{comment.content}</p>}
          {comment.imageUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-sm max-w-[260px] bg-slate-50 min-h-[100px] flex items-center justify-center">
              <img 
                src={comment.imageUrl} 
                className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity" 
                alt="Comment media" 
                loading="lazy"
                onLoad={(e) => e.target.parentElement.classList.remove('min-h-[100px]', 'bg-slate-50')}
                onClick={() => window.open(comment.imageUrl, '_blank')} 
              />
            </div>
          )}
          {reactionList.length > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 flex items-center gap-1 text-[10px]">
              <span className="text-slate-500 font-bold">{reactionList.length}</span>
              <div className="flex -space-x-1 items-center">
                {Array.from(new Set(reactionList)).slice(0, 3).map((emo, i) => (
                  <div key={i} className="bg-white rounded-full ring-1 ring-slate-100 flex items-center justify-center w-3.5 h-3.5">
                    {emo === "👍" ? <div className="bg-blue-500 rounded-full flex items-center justify-center w-full h-full"><ThumbsUp size={6} className="text-white fill-white" /></div> : <span className="text-[10px]">{emo}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
 
           {/* Options menu (Delete) */}
           {(String(currentUser?.id) === String(author?.id) || String(currentUser?.id) === String(post?.author?.id) || currentUser?.roles?.includes("ADMIN")) && (
             <div className="absolute left-full top-2 ml-1 z-20" ref={optionsRef}>
               <button onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors opacity-0 group-hover/comment:opacity-100">
                 <MoreHorizontal size={14} />
               </button>
               {showOptions && (
                 <div className="absolute top-0 left-full ml-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 animate-in fade-in slide-in-from-left-1">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleDeleteComment(comment.id);
                       setShowOptions(false);
                     }}
                     className="w-full px-4 py-2 text-left text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                   >
                     Xóa bình luận
                   </button>
                 </div>
               )}
             </div>
           )}
         </div>

        <div className="flex gap-4 text-[11px] font-bold text-slate-500 ml-2 mt-1 items-center">
          <div className="relative group/react">
            <button onClick={() => handleReactComment(comment.id, userCommentReaction || "👍")} className={`hover:opacity-80 transition-opacity flex items-center gap-1 ${hasLikedComment ? (REACTION_COLORS[userCommentReaction] || 'text-blue-600') : 'text-slate-500'}`}>
              {userCommentReaction ? (userCommentReaction === "👍" ? <ThumbsUp size={12} className="fill-current" /> : <span>{userCommentReaction}</span>) : (<ThumbsUp size={12} />)}
              <span>{hasLikedComment ? (REACTION_LABELS[userCommentReaction] || "Đã thích") : "Thích"}</span>
            </button>
            <div className="absolute bottom-full left-0 pb-2 hidden group-hover/react:flex animate-in fade-in slide-in-from-bottom-1 z-20 min-w-max">
              <div className="bg-white rounded-full shadow-xl border border-slate-100 p-1 flex gap-1 items-center">
                {EMOJIS.slice(0, 8).map(emo => (
                  <div key={emo} className="relative group/emo">
                    <button onClick={(e) => { e.stopPropagation(); handleReactComment(comment.id, emo); }} className="hover:scale-150 transition-transform text-lg p-1 active:scale-90 block">
                      {emo}
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/emo:block bg-slate-900 text-white text-[9px] px-2 py-1 rounded-lg shadow-xl whitespace-nowrap font-bold">
                      {REACTION_LABELS[emo]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { setActiveReplyId(comment.id); setReplyContent(""); }} className="hover:text-blue-600 transition-colors btn-reply-trigger flex items-center gap-1"><MessageCircle size={12} /><span>Phản hồi</span></button>
          <span className="font-normal text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {comment.replies?.length > 0 && (
          <div className="space-y-1">
            {!showAllReplies && !isReply ? (
              <button
                onClick={() => setShowAllReplies(true)}
                className="flex items-center gap-2 ml-2 mt-2 text-[12px] font-bold text-slate-500 hover:underline group"
              >
                <div className="w-8 h-[1px] bg-slate-200 group-hover:bg-blue-200" />
                Xem tất cả {countTotalComments(comment.replies)} phản hồi
              </button>
            ) : (
              (showAllReplies || isReply ? comment.replies : []).map((reply) => (
                <RenderComment key={reply.id} comment={reply} post={post} isReply={true} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} replyContent={replyContent} setReplyContent={setReplyContent} handleSubmitReply={handleSubmitReply} handleReactComment={handleReactComment} isSubmittingComment={isSubmittingComment} currentUser={currentUser} handleDeleteComment={handleDeleteComment} />
              ))
            )}
          </div>
        )}

        {activeReplyId === comment.id && (
          <div className="mt-3 flex gap-2 animate-in slide-in-from-top-1 reply-input-container">
            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
              <img
                src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || 'User'}`}
                className="w-full h-full object-cover"
                alt="User"
              />
            </div>
            <div className="flex-1 relative">
              <textarea ref={replyTextareaRef} autoFocus value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Phản hồi ${author?.fullName}...`} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-[13px] opacity-70 focus:opacity-100 focus:bg-white focus:border-slate-300 transition-all duration-300 resize-none min-h-[40px] pr-20 outline-none overflow-hidden" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitReply(comment.id, replyContent); setReplyContent(""); setActiveReplyId(null); } }} />
              <div className="absolute right-2 bottom-1.5 flex items-center gap-1.5">
                <button onClick={() => setShowLocalEmojiPicker(!showLocalEmojiPicker)} className={`p-1.5 rounded-full transition-colors ${showLocalEmojiPicker ? 'bg-amber-100 text-amber-500' : 'text-slate-400 hover:bg-slate-200'}`}><Smile size={18} /></button>
                {showLocalEmojiPicker && (
                  <div ref={localEmojiPickerRef} className="absolute bottom-full right-0 mb-3 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-5 gap-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 w-[220px]">
                    {EMOJIS.map(emoji => <button key={emoji} onClick={() => addEmojiToReply(emoji)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-xl transition-all hover:scale-110 active:scale-90">{emoji}</button>)}
                  </div>
                )}
                <button onClick={() => { handleSubmitReply(comment.id, replyContent); setReplyContent(""); setActiveReplyId(null); }} disabled={!replyContent.trim() || isSubmittingComment} className="p-1.5 bg-blue-600 text-white rounded-full disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:bg-blue-700 active:scale-90 shadow-sm">{isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetailManagement = ({
  post,
  comments = [],
  currentUser,
  loading = false,
  error = null,
  handleReactPost,
   handleReactComment,
   handleSubmitComment,
   handleSubmitReply,
   handleDeleteComment,
   isSubmittingComment = false,
   onRefresh,
  backPath = -1,
  hideHeader = false
}) => {
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentFilter, setCommentFilter] = useState("RELEVANT"); // RELEVANT, NEWEST, ALL
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {}, type: "danger" });

  const emojiPickerRef = useRef(null);
  const stickerPickerRef = useRef(null);
  const mainTextareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (mainTextareaRef.current) {
      mainTextareaRef.current.style.height = 'inherit';
      mainTextareaRef.current.style.height = `${mainTextareaRef.current.scrollHeight}px`;
    }
  }, [commentContent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) setShowEmojiPicker(false);
      if (stickerPickerRef.current && !stickerPickerRef.current.contains(event.target)) setShowStickerPicker(false);
      if (!event.target.closest('.reply-input-container') && !event.target.closest('.btn-reply-trigger')) setActiveReplyId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (post?.id) {
      const timer = setTimeout(() => {
        eventService.incrementPostView(post.id).catch(() => { });
      }, 3000); // Tăng view nếu người dùng xem bài viết quá 3 giây
      return () => clearTimeout(timer);
    }
  }, [post?.id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingImage(true);
    try {
      const res = await eventService.uploadImage(formData);
      setSelectedImage(res.data.url);
    } catch (err) {
      toast.error("Không thể tải ảnh lên");
    } finally {
      setIsUploadingImage(false);
    }
  };

   const handlePostComment = async (content) => {
    if (!content.trim() && !selectedImage) return;
    await handleSubmitComment(content, selectedImage);
    setCommentContent("");
    setSelectedImage(null);
  };

  const triggerDelete = (commentId) => {
    setConfirmConfig({
      isOpen: true,
      title: "Xóa bình luận?",
      message: "Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.",
      type: "danger",
      onConfirm: () => handleDeleteComment(commentId)
    });
  };


  const totalComments = useMemo(() => {
    const localCount = countTotalComments(comments);
    // Ưu tiên số lượng thực tế từ mảng comments nếu nó lớn hơn hoặc bằng commentCount từ post
    if (post?.commentCount !== undefined) {
      return Math.max(post.commentCount, localCount);
    }
    return localCount;
  }, [post?.commentCount, comments]);

  const filteredComments = useMemo(() => {
    let list = [...comments];
    if (commentFilter === "NEWEST") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (commentFilter === "RELEVANT") {
      // Logic "Phù hợp nhất": Ưu tiên bình luận của tác giả, sau đó đến số lượng tương tác
      list.sort((a, b) => {
        const isAuthorA = String(a.commenter?.id) === String(post?.author?.id);
        const isAuthorB = String(b.commenter?.id) === String(post?.author?.id);
        if (isAuthorA && !isAuthorB) return -1;
        if (!isAuthorA && isAuthorB) return 1;
        const reactionsA = Object.keys(a.reactions || {}).length;
        const reactionsB = Object.keys(b.reactions || {}).length;
        if (reactionsB !== reactionsA) return reactionsB - reactionsA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return list;
  }, [comments, commentFilter, post?.author?.id]);

  const FILTER_OPTIONS = {
    RELEVANT: { label: "Phù hợp nhất", desc: "Hiển thị bình luận của bạn bè và những bình luận có nhiều lượt tương tác nhất trước tiên." },
    NEWEST: { label: "Mới nhất", desc: "Hiển thị tất cả bình luận, mới nhất trước tiên." },
    ALL: { label: "Tất cả bình luận", desc: "Hiển thị tất cả bình luận, bao gồm cả nội dung có thể là spam." }
  };

  if (loading) return (
    <div className={`flex flex-col items-center justify-center ${hideHeader ? 'py-10' : 'min-h-screen'} text-gray-500 bg-gray-50`}>
      <Loader2 className="animate-spin mb-2 text-blue-600" size={40} />
      <p className="font-medium">Đang tải nội dung bài viết...</p>
    </div>
  );

  if (error || !post) return (
    <div className={`text-center ${hideHeader ? 'py-10' : 'py-20'} text-red-500 bg-gray-50 min-h-screen px-4`}>
      <div className="bg-white p-8 rounded-2xl shadow-sm inline-block max-w-md">
        <p className="text-lg font-semibold">{error || "Không tìm thấy bài viết"}</p>
        <button onClick={onRefresh} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">Thử lại</button>
      </div>
    </div>
  );

  const postReactions = post.reactions || {};
  const postReactionList = Object.values(postReactions);
  const userReaction = currentUser ? postReactions[currentUser.id] : null;
  const hasLiked = !!userReaction;

  return (
    <div className={`${hideHeader ? 'w-full' : 'bg-slate-50 min-h-screen p-6 flex flex-col items-center'}`}>
      {!hideHeader && (
        <div className="w-full mb-4">
          <button onClick={() => navigate(backPath)} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-all">
            <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all"><ArrowLeft size={16} /></div>
            Quay lại
          </button>
        </div>
      )}

      <div className={`w-full bg-white ${hideHeader ? '' : 'rounded-2xl shadow-sm border border-slate-200'} h-fit relative overflow-visible`}>
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm"><img src={post.author?.avatarUrl || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="author" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] text-slate-900">{post.author?.fullName || "Tác giả"}</h3>
                {post.pinned && <Pin size={14} className="text-blue-600 fill-blue-600" />}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                {post.author?.email && <><span className="text-blue-500 font-medium">{post.author.email}</span><span>•</span></>}
                <span>{formatRelativeTime(post.publishedAt || post.createdAt)}</span>
                <span>•</span><Globe size={12} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 mt-2">
          {post.eventTitle && <div className="flex items-center gap-1.5 text-blue-600 mb-3"><span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">Sự kiện: {post.eventTitle}</span></div>}
          <h2 className="text-2xl font-bold mb-3 text-slate-800 leading-tight">{post.title}</h2>
          <p className="text-[16px] leading-relaxed text-slate-700 whitespace-pre-line">{post.content}</p>
        </div>

        {post.imageUrls?.length > 0 && (
          <div className="bg-slate-50 border-y border-slate-100 overflow-hidden">
            <div className={`grid gap-1 ${post.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.imageUrls.map((url, idx) => <img key={idx} src={url} alt={`Post media ${idx}`} className="w-full h-auto max-h-[500px] object-cover mx-auto" />)}
            </div>
          </div>
        )}

        <div className="px-4 py-3 flex justify-between items-center text-slate-500 text-[13px] border-b border-slate-50">
          <div className="flex items-center gap-3">
            {postReactionList.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 text-[14px]">{postReactionList.length}</span>
                <div className="flex -space-x-1 items-center">
                  {Array.from(new Set(postReactionList)).slice(0, 3).map((emo, i) => (
                    <div key={i} className="bg-white rounded-full ring-1 ring-slate-100 flex items-center justify-center w-4 h-4 shadow-sm">
                      {emo === "👍" ? <div className="bg-blue-500 rounded-full flex items-center justify-center w-full h-full"><ThumbsUp size={8} className="text-white fill-white" /></div> : <span className="text-[12px]">{emo}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="font-medium text-slate-500">{totalComments} bình luận</div>
        </div>

        <div className="px-2 py-1 flex border-b border-slate-100">
          <div className="flex-1 relative group/post-react">
            <button onClick={() => handleReactPost(userReaction || "👍")} className={`w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all font-bold text-[14px] ${hasLiked ? (REACTION_COLORS[userReaction] || 'text-blue-600') : 'text-slate-600'}`}>
              {userReaction ? (userReaction === "👍" ? <ThumbsUp size={18} className="fill-current" /> : <span className="text-lg">{userReaction}</span>) : <ThumbsUp size={18} />}
              <span>{hasLiked ? (REACTION_LABELS[userReaction] || "Đã thích") : "Thích"}</span>
            </button>
            <div className="absolute bottom-full left-0 sm:left-4 pb-3 hidden group-hover/post-react:flex animate-in fade-in slide-in-from-bottom-2 z-30 min-w-max">
              <div className="bg-white rounded-full shadow-2xl border border-slate-100 p-2 flex gap-2 items-center">
                {EMOJIS.slice(0, 8).map(emo => (
                  <div key={emo} className="relative group/emo">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleReactPost(emo); }} className="hover:scale-150 transition-transform text-2xl p-1 active:scale-90 block">
                      {emo}
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/emo:block bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap font-black uppercase tracking-wider">
                      {REACTION_LABELS[emo]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => mainTextareaRef.current?.focus()} className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"><MessageCircle size={18} /> Bình luận</button>
          <button
            onClick={() => {
              const url = `${window.location.origin}/posts/${post.id}`;
              navigator.clipboard.writeText(url);
              toast.success("Đã sao chép liên kết bài viết!");
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"
          >
            <Share2 size={18} /> Chia sẻ
          </button>
        </div>

        <div className="p-4 bg-slate-50/30">
          {post.allowComments ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-slate-800 text-sm">Bình luận</div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {FILTER_OPTIONS[commentFilter].label}
                    <motion.div animate={{ rotate: showFilterDropdown ? 180 : 0 }}>
                      <Loader2 size={14} className="opacity-0 w-0" /> {/* Spacer */}
                      <span className="text-[10px]">▼</span>
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showFilterDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                        {Object.entries(FILTER_OPTIONS).map(([key, opt]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setCommentFilter(key);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex flex-col gap-0.5 ${commentFilter === key ? 'bg-blue-50/50' : ''}`}
                          >
                            <span className={`text-[13px] font-bold ${commentFilter === key ? 'text-blue-600' : 'text-slate-800'}`}>
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-slate-500 leading-normal">
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 shadow-sm border border-white">
                    <img src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || 'User'}`} className="w-full h-full object-cover" alt="User" />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <form onSubmit={(e) => { e.preventDefault(); handlePostComment(commentContent); }}>
                        <div className="relative bg-slate-50 border border-slate-200 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-slate-300 shadow-sm overflow-hidden">
                          {selectedImage && (
                            <div className="p-3 relative inline-block">
                              <img src={selectedImage} className="w-24 h-24 object-cover rounded-lg border border-slate-100" alt="Preview" />
                              <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors shadow-lg"><X size={12} /></button>
                            </div>
                          )}
                          <textarea ref={mainTextareaRef} value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Viết bình luận..." className="w-full bg-transparent px-4 py-2.5 text-sm resize-none min-h-[44px] pr-32 outline-none overflow-hidden block" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(commentContent); } }} />
                          <div className="absolute right-2 bottom-1.5 flex items-center gap-1.5">
                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 rounded-full transition-colors ${showEmojiPicker ? 'bg-amber-100 text-amber-500' : 'text-slate-400 hover:bg-slate-200'}`} title="Emoji"><Smile size={18} /></button>
                            <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className={`p-1.5 rounded-full transition-colors ${showStickerPicker ? 'bg-indigo-100 text-indigo-500' : 'text-slate-400 hover:bg-slate-200'}`} title="Nhãn dán"><Clock size={18} /></button>
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className={`p-1.5 rounded-full transition-colors text-slate-400 hover:bg-slate-200 ${isUploadingImage ? 'animate-pulse' : ''}`} title="Gửi ảnh"><Camera size={18} /></button>
                            <button type="submit" disabled={(!commentContent.trim() && !selectedImage) || isSubmittingComment || isUploadingImage} className="p-1.5 bg-blue-600 text-white rounded-full disabled:bg-slate-200 shadow-sm transition-transform active:scale-95">{isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                      </form>

                      {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-3 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-5 gap-1.5 z-20 animate-in fade-in slide-in-from-bottom-2 w-[220px]">
                          {EMOJIS.map(emoji => <button key={emoji} onClick={() => setCommentContent(prev => prev + emoji)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-xl transition-all hover:scale-110 active:scale-90">{emoji}</button>)}
                        </div>
                      )}

                      {showStickerPicker && (
                        <div ref={stickerPickerRef} className="absolute bottom-full right-0 mb-3 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-4 gap-2 z-20 animate-in fade-in slide-in-from-bottom-2 w-[280px] max-h-[300px] overflow-y-auto">
                          {STICKERS.map((sticker, idx) => (
                            <button key={idx} onClick={() => { handleSubmitComment("", sticker); setShowStickerPicker(false); }} className="hover:bg-slate-50 p-1 rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center">
                              <img src={sticker} className="w-full h-auto rounded-md" alt={`Sticker ${idx}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {filteredComments.length > 0 ? filteredComments.map((comment) => (
                    <RenderComment key={comment.id} comment={comment} post={post} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} replyContent={replyContent} setReplyContent={setReplyContent} handleSubmitReply={handleSubmitReply} handleReactComment={handleReactComment} isSubmittingComment={isSubmittingComment} currentUser={currentUser} handleDeleteComment={triggerDelete} />
                  )) : (
                    <div className="text-center py-10"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><MessageCircle className="text-slate-300" size={32} /></div><p className="text-slate-400 text-sm italic">Hãy là người đầu tiên bình luận.</p></div>
                  )}
                 </div>
               </div>
             </>
           ) : (<div className="text-center py-6 bg-slate-100 rounded-2xl border border-dashed border-slate-200"><p className="text-slate-500 text-sm font-medium">Bình luận đã bị tắt.</p></div>)}
         </div>
 
         <ConfirmModal
           isOpen={confirmConfig.isOpen}
           onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
           onConfirm={confirmConfig.onConfirm}
           title={confirmConfig.title}
           message={confirmConfig.message}
           type={confirmConfig.type}
         />
       </div>
    </div>
  );
};

export default PostDetailManagement;
