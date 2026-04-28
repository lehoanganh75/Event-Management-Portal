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
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky";

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
}) => {
  const [showLocalEmojiPicker, setShowLocalEmojiPicker] = useState(false);
  const localEmojiPickerRef = useRef(null);
  const replyTextareaRef = useRef(null);

  useEffect(() => {
    if (replyTextareaRef.current && activeReplyId === comment.id) {
      replyTextareaRef.current.style.height = 'inherit';
      replyTextareaRef.current.style.height = `${replyTextareaRef.current.scrollHeight}px`;
    }
  }, [replyContent, activeReplyId, comment.id]);

  const avatar = comment.author?.avatarUrl && comment.author.avatarUrl !== "default-avatar-url.png"
    ? comment.author.avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.fullName || 'User'}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (localEmojiPickerRef.current && !localEmojiPickerRef.current.contains(event.target)) {
        setShowLocalEmojiPicker(false);
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
    <div className={`flex gap-3 ${isReply ? "mt-3 ml-8" : "mt-4"}`}>
      <img src={avatar} alt="avatar" className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full flex-shrink-0 object-cover border border-slate-100 shadow-sm`} />
      <div className="flex-1 min-w-0">
        <div className="inline-block bg-slate-100 rounded-2xl px-4 py-2 max-w-full shadow-sm relative group">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-[13px] text-slate-900">{comment.author?.fullName || "Người dùng"}</p>
            {comment.authorAccountId === post?.authorAccountId && (
              <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Tác giả</span>
            )}
          </div>
          <p className="text-[14px] text-slate-800 break-all leading-relaxed">{comment.content}</p>
          {reactionList.length > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-1 py-0.5 shadow-sm border border-slate-100 flex items-center gap-0.5 text-[10px]">
              <div className="flex -space-x-1 items-center">
                {Array.from(new Set(reactionList)).slice(0, 3).map((emo, i) => (
                  <span key={i} className="bg-white rounded-full ring-1 ring-slate-50">{emo}</span>
                ))}
              </div>
              <span className="ml-0.5 font-bold text-slate-500">{reactionList.length}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 text-[11px] font-bold text-slate-500 ml-2 mt-1 items-center">
          <div className="relative group/react">
            <button onClick={() => handleReactComment(comment.id, "👍")} className={`hover:text-blue-600 transition-colors flex items-center gap-1 ${hasLikedComment ? 'text-blue-600' : ''}`}>
              {userCommentReaction ? (userCommentReaction === "👍" ? <ThumbsUp size={12} className="fill-blue-600" /> : <span>{userCommentReaction}</span>) : (<ThumbsUp size={12} />)}
              <span>{hasLikedComment ? (REACTION_LABELS[userCommentReaction] || "Đã thích") : "Thích"}</span>
            </button>
            <div className="absolute bottom-full left-0 pb-2 hidden group-hover/react:flex animate-in fade-in slide-in-from-bottom-1 z-20">
              <div className="bg-white rounded-full shadow-xl border border-slate-100 p-1 flex gap-1">
                {EMOJIS.slice(0, 8).map(emo => (
                  <button key={emo} onClick={(e) => { e.stopPropagation(); handleReactComment(comment.id, emo); }} className="hover:scale-150 transition-transform text-lg p-0.5">{emo}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { setActiveReplyId(comment.id); setReplyContent(""); }} className="hover:text-blue-600 transition-colors btn-reply-trigger flex items-center gap-1"><MessageCircle size={12} /><span>Phản hồi</span></button>
          <span className="font-normal text-slate-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>

        {comment.replies?.length > 0 && (
          <div className="space-y-1">
            {comment.replies.map((reply) => (
              <RenderComment key={reply.id} comment={reply} post={post} isReply={true} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} replyContent={replyContent} setReplyContent={setReplyContent} handleSubmitReply={handleSubmitReply} handleReactComment={handleReactComment} isSubmittingComment={isSubmittingComment} currentUser={currentUser} />
            ))}
          </div>
        )}

        {activeReplyId === comment.id && (
          <div className="mt-3 flex gap-2 animate-in slide-in-from-top-1 reply-input-container">
            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0"><img src={DEFAULT_AVATAR} className="w-full h-full object-cover" alt="User" /></div>
            <div className="flex-1 relative">
              <textarea ref={replyTextareaRef} autoFocus value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Phản hồi ${comment.author?.fullName}...`} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-[13px] opacity-70 focus:opacity-100 focus:bg-white focus:border-slate-300 transition-all duration-300 resize-none min-h-[40px] pr-20 outline-none overflow-hidden" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitReply(comment.id); } }} />
              <div className="absolute right-2 bottom-1.5 flex items-center gap-1.5">
                <button onClick={() => setShowLocalEmojiPicker(!showLocalEmojiPicker)} className={`p-1.5 rounded-full transition-colors ${showLocalEmojiPicker ? 'bg-amber-100 text-amber-500' : 'text-slate-400 hover:bg-slate-200'}`}><Smile size={18} /></button>
                {showLocalEmojiPicker && (
                  <div ref={localEmojiPickerRef} className="absolute bottom-full right-0 mb-3 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-5 gap-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 w-[220px]">
                    {EMOJIS.map(emoji => <button key={emoji} onClick={() => addEmojiToReply(emoji)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-xl transition-all hover:scale-110 active:scale-90">{emoji}</button>)}
                  </div>
                )}
                <button onClick={() => handleSubmitReply(comment.id)} disabled={!replyContent.trim() || isSubmittingComment} className="p-1.5 bg-blue-600 text-white rounded-full disabled:bg-slate-200 disabled:text-slate-400 transition-all hover:bg-blue-700 active:scale-90 shadow-sm">{isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
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
  isSubmittingComment = false,
  onRefresh,
  backPath = -1
}) => {
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef(null);
  const mainTextareaRef = useRef(null);

  useEffect(() => {
    if (mainTextareaRef.current) {
      mainTextareaRef.current.style.height = 'inherit';
      mainTextareaRef.current.style.height = `${mainTextareaRef.current.scrollHeight}px`;
    }
  }, [commentContent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) setShowEmojiPicker(false);
      if (!event.target.closest('.reply-input-container') && !event.target.closest('.btn-reply-trigger')) setActiveReplyId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const countTotalComments = useCallback((list) => {
    if (!list || list.length === 0) return 0;
    return list.reduce((total, comment) => total + 1 + countTotalComments(comment.replies), 0);
  }, []);

  const totalComments = useMemo(() => countTotalComments(comments), [comments, countTotalComments]);

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
        <button onClick={onRefresh} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">Thử lại</button>
      </div>
    </div>
  );

  const postReactions = post.reactions || {};
  const postReactionList = Object.values(postReactions);
  const userReaction = currentUser ? postReactions[currentUser.id] : null;
  const hasLiked = !!userReaction;

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-6 flex flex-col items-center">
      <div className="w-full mb-4">
        <button onClick={() => navigate(backPath)} className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-all">
          <div className="w-8 h-8 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all"><ArrowLeft size={16} /></div>
          Quay lại
        </button>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
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
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleString('vi-VN')}</span>
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
          <div className="flex items-center gap-1.5">
            {postReactionList.length > 0 ? (
              <div className="flex -space-x-1 items-center mr-1">
                {Array.from(new Set(postReactionList)).slice(0, 3).map((emo, i) => <span key={i} className="text-base bg-white rounded-full shadow-sm ring-1 ring-slate-100">{emo}</span>)}
              </div>
            ) : (<div className="bg-blue-500 p-1 rounded-full"><ThumbsUp size={10} className="text-white fill-white" /></div>)}
            <span className="font-medium">{postReactionList.length > 0 ? `${postReactionList.length} người tương tác` : `${post.viewCount || 0} lượt xem`}</span>
          </div>
          <div className="font-medium">{totalComments} bình luận</div>
        </div>

        <div className="px-2 py-1 flex border-b border-slate-100">
          <div className="flex-1 relative group/post-react">
            <button onClick={() => handleReactPost("👍")} className={`w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all font-bold text-[14px] ${hasLiked ? 'text-blue-600' : 'text-slate-600'}`}>
              {userReaction ? (userReaction === "👍" ? <ThumbsUp size={18} className="fill-blue-600" /> : <span className="text-lg">{userReaction}</span>) : <ThumbsUp size={18} />}
              <span>{hasLiked ? (REACTION_LABELS[userReaction] || "Đã thích") : "Thích"}</span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 hidden group-hover/post-react:flex animate-in fade-in slide-in-from-bottom-2 z-30">
              <div className="bg-white rounded-full shadow-2xl border border-slate-100 p-1.5 flex gap-2">
                {EMOJIS.slice(0, 8).map(emo => <button key={emo} type="button" onClick={(e) => { e.stopPropagation(); handleReactPost(emo); }} className="hover:scale-150 transition-transform text-2xl p-1 active:scale-90">{emo}</button>)}
              </div>
            </div>
          </div>
          <button onClick={() => mainTextareaRef.current?.focus()} className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"><MessageCircle size={18} /> Bình luận</button>
        </div>

        <div className="p-4 bg-slate-50/30">
          {post.allowComments ? (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 shadow-sm border border-white">
                  <img src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || 'User'}`} className="w-full h-full object-cover" alt="User" />
                </div>
                <div className="flex-1 relative">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitComment(commentContent); setCommentContent(""); }}>
                    <textarea ref={mainTextareaRef} value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Viết bình luận..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm opacity-70 focus:opacity-100 focus:bg-white focus:border-slate-300 transition-all duration-300 resize-none min-h-[44px] pr-20 outline-none overflow-hidden" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(commentContent); setCommentContent(""); } }} />
                    <div className="absolute right-2 bottom-1.5 flex items-center gap-1.5">
                      <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 rounded-full transition-colors ${showEmojiPicker ? 'bg-amber-100 text-amber-500' : 'text-slate-400 hover:bg-slate-200'}`}><Smile size={18} /></button>
                      <button type="submit" disabled={!commentContent.trim() || isSubmittingComment} className="p-1.5 bg-blue-600 text-white rounded-full disabled:bg-slate-200 shadow-sm">{isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
                    </div>
                  </form>
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-3 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-5 gap-1.5 z-20 animate-in fade-in slide-in-from-bottom-2 w-[220px]">
                      {EMOJIS.map(emoji => <button key={emoji} onClick={() => setCommentContent(prev => prev + emoji)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-xl transition-all hover:scale-110 active:scale-90">{emoji}</button>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                {comments.length > 0 ? comments.map((comment) => (
                  <RenderComment key={comment.id} comment={comment} post={post} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} replyContent={replyContent} setReplyContent={setReplyContent} handleSubmitReply={handleSubmitReply} handleReactComment={handleReactComment} isSubmittingComment={isSubmittingComment} currentUser={currentUser} />
                )) : (
                  <div className="text-center py-10"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><MessageCircle className="text-slate-300" size={32} /></div><p className="text-slate-400 text-sm italic">Hãy là người đầu tiên bình luận.</p></div>
                )}
              </div>
            </div>
          ) : (<div className="text-center py-6 bg-slate-100 rounded-2xl border border-dashed border-slate-200"><p className="text-slate-500 text-sm font-medium">Bình luận đã bị tắt.</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default PostDetailManagement;
