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
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import eventService from "../../../services/eventService";
import { createStompClient } from "../../../utils/socket";
import { useLanguage } from "../../../context/LanguageContext";

const EMOJIS = ["❤️", "👍", "🔥", "😊", "🎉", "👏", "😮", "😢", "🙌", "✨", "🙏", "💯", "🤣", "😍", "💡"];
const getReactionLabels = (t) => ({
  "👍": t('like'),
  "❤️": t('react_love'),
  "🔥": t('react_awesome'),
  "😊": t('react_happy'),
  "🎉": t('react_congrats'),
  "👏": t('react_applause'),
  "😮": t('react_wow'),
  "😢": t('react_sad'),
  "🤣": t('react_haha'),
  "😍": t('react_love'),
  "🙌": t('react_great'),
  "✨": t('react_sparkle'),
  "🙏": t('react_respect'),
  "💯": t('react_perfect'),
  "💡": t('react_useful')
});

const REACTION_COLORS = {
  "👍": "text-blue-600",
  "❤️": "text-red-500",
  "🔥": "text-orange-500",
  "😊": "text-amber-500",
  "🎉": "text-amber-500",
  "👏": "text-amber-500",
  "😮": "text-amber-500",
  "😢": "text-blue-400",
  "🤣": "text-amber-500",
  "😍": "text-red-400",
  "🙌": "text-amber-500",
  "✨": "text-amber-500",
  "🙏": "text-amber-500",
  "💯": "text-red-600",
  "💡": "text-amber-400"
};

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky";

const ANONYMOUS_IDENTITIES = [
  { name: "Thỏ ẩn danh", icon: "🐰", color: "bg-pink-50 text-pink-500" },
  { name: "Sói ẩn danh", icon: "🐺", color: "bg-slate-100 text-slate-600" },
  { name: "Gấu ẩn danh", icon: "🐻", color: "bg-orange-50 text-orange-600" },
  { name: "Cáo ẩn danh", icon: "🦊", color: "bg-orange-100 text-orange-500" },
  { name: "Mèo ẩn danh", icon: "🐱", color: "bg-yellow-50 text-yellow-600" },
  { name: "Hổ ẩn danh", icon: "🐯", color: "bg-amber-50 text-amber-600" },
  { name: "Sư tử ẩn danh", icon: "🦁", color: "bg-yellow-100 text-yellow-700" },
  { name: "Ếch ẩn danh", icon: "🐸", color: "bg-green-50 text-green-600" },
  { name: "Khỉ ẩn danh", icon: "🐵", color: "bg-brown-50 text-amber-800" },
  { name: "Gấu trúc ẩn danh", icon: "🐼", color: "bg-slate-50 text-slate-800" }
];

const getRelativeTime = (date, t) => {
  const now = new Date();
  let past;
  
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+')) {
    // If it's a string from backend without TZ, assume UTC and append Z
    // Replace space with T for ISO compliance if needed
    past = new Date(date.replace(' ', 'T') + 'Z');
  } else {
    past = new Date(date);
  }
  
  // Handle potential timezone or clock sync issues
  const diffInMs = Math.max(0, now.getTime() - past.getTime());
  
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);

  if (diffInSec < 60) return t('time_now');
  if (diffInMin < 60) return `${diffInMin} ${t('time_min')}`;
  if (diffInHour < 24) return `${diffInHour} ${t('time_hour')}`;
  if (diffInDay < 7) return `${diffInDay} ${t('time_day')}`;
  return past.toLocaleDateString();
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
  handleDeleteComment,
  handleHideComment,
  setActionModal,
  isSubmittingComment,
  currentUser,
  setFullscreenImage,
}) => {
  const { t, language } = useLanguage();
  const REACTION_LABELS = getReactionLabels(t);
  const [showLocalEmojiPicker, setShowLocalEmojiPicker] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);
  const localEmojiPickerRef = useRef(null);
  const replyTextareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (replyTextareaRef.current && activeReplyId === comment.id) {
      replyTextareaRef.current.style.height = 'inherit';
      replyTextareaRef.current.style.height = `${replyTextareaRef.current.scrollHeight}px`;
    }
  }, [replyContent, activeReplyId, comment.id]);

  const isAnon = comment.isAnonymous || comment.anonymous;
  const author = isAnon ? { fullName: comment.anonymousIdentity || (language === 'VI' ? "Người dùng ẩn danh" : "Anonymous User") } : (comment.commenter || comment.author);
  
  const avatar = isAnon 
    ? null 
    : (author?.avatarUrl && author.avatarUrl !== "default-avatar-url.png"
      ? author.avatarUrl
      : `https://api.dicebear.com/7.x/initials/svg?seed=${author?.fullName || 'User'}`);

  const anonymousInfo = isAnon ? ANONYMOUS_IDENTITIES.find(id => id.name === comment.anonymousIdentity) || ANONYMOUS_IDENTITIES[0] : null;

  const toggleAnonymousMode = (enabled) => {
    if (!enabled) {
      setIsAnonEnabled(false);
      setCurrentAnonIdentity(null);
    } else {
      setIsAnonEnabled(true);
      const randomId = ANONYMOUS_IDENTITIES[Math.floor(Math.random() * ANONYMOUS_IDENTITIES.length)];
      setCurrentAnonIdentity(randomId);
    }
  };

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

  const userAvatar = currentUser?.avatarUrl && currentUser.avatarUrl !== "default-avatar-url.png"
    ? currentUser.avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || 'User'}`;

  return (
    <div className={`flex gap-3 ${isReply ? "mt-3 ml-8" : "mt-4"}`}>
      {isAnon ? (
        <div className={`${isReply ? "w-6 h-6 text-sm" : "w-8 h-8 text-lg"} rounded-full flex items-center justify-center shadow-sm border border-slate-100 ${anonymousInfo.color}`}>
          {anonymousInfo.icon}
        </div>
      ) : (
        <img src={avatar} alt="avatar" className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full flex-shrink-0 object-cover border border-slate-100 shadow-sm`} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center group/comment-main">
          <div className="inline-block bg-slate-100 rounded-2xl px-4 py-2 max-w-[85%] shadow-sm relative group">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-[13px] text-slate-900">{author?.fullName || (language === 'VI' ? "Người dùng" : "User")}</p>
              {String(author?.id) === String(post?.author?.id) && (
                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{t('author_label')}</span>
              )}
            </div>
            <p className="text-[14px] text-slate-800 break-all leading-relaxed">{comment.content}</p>
            
            {comment.imageUrls?.length > 0 && (
              <div className="mt-2 grid grid-cols-1 gap-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {comment.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video overflow-hidden bg-slate-50 cursor-zoom-in" onClick={() => setFullscreenImage(url)}>
                    <img src={url} alt="comment-media" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Reaction badges */}
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

          {/* More Actions Menu - Outside Bubble */}
          {(String(currentUser?.id) === String(comment.commenterAccountId || (comment.commenter || comment.author)?.id) || String(currentUser?.id) === String(post?.author?.id)) && (
            <div className="opacity-0 group-hover/comment-main:opacity-100 transition-opacity ml-1">
              <div className="relative group/menu">
                <button className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-slate-200 rounded-full text-slate-500 transition-all">
                  <MoreHorizontal size={16} />
                </button>
                <div className="absolute top-0 left-full pl-2 hidden group-hover/menu:block z-50 animate-in fade-in slide-in-from-left-2">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-100 p-1.5 w-36 overflow-hidden ring-1 ring-black/5">
                    {String(currentUser?.id) === String(comment.commenterAccountId || (comment.commenter || comment.author)?.id) && (
                      <>
                        <button 
                          onClick={() => setActionModal({ show: true, type: 'delete', commentId: comment.id })}
                          className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <XCircle size={14} /> {t('delete')}
                        </button>
                      </>
                    )}
                    {String(currentUser?.id) === String(post?.author?.id) && String(currentUser?.id) !== String(comment.commenterAccountId || (comment.commenter || comment.author)?.id) && (
                      <>
                        <button 
                          onClick={() => setActionModal({ show: true, type: 'hide', commentId: comment.id })}
                          className="w-full text-left px-3 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Eye size={14} className="text-slate-400" /> {language === 'VI' ? 'Ẩn bình luận' : 'Hide comment'}
                        </button>
                        <button 
                          onClick={() => setActionModal({ show: true, type: 'delete', commentId: comment.id })}
                          className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors border-t border-slate-50"
                        >
                          <XCircle size={14} /> {t('delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 text-[11px] font-bold text-slate-500 ml-2 mt-1 items-center">
          <div className="relative group/react">
            <button
              onClick={() => handleReactComment(comment.id, userCommentReaction ? userCommentReaction : "👍")}
              className={`hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${hasLikedComment ? (REACTION_COLORS[userCommentReaction] || 'text-blue-600') : 'hover:text-blue-600'}`}
            >
              {userCommentReaction ? (userCommentReaction === "👍" ? <ThumbsUp size={12} className="fill-blue-600" /> : <span>{userCommentReaction}</span>) : (<ThumbsUp size={12} />)}
              <span>{hasLikedComment ? (REACTION_LABELS[userCommentReaction] || t('liked_label')) : t('like')}</span>
            </button>
            <div className="absolute bottom-full left-0 pb-2 hidden group-hover/react:flex animate-in fade-in slide-in-from-bottom-1 z-40">
              <div className="bg-white rounded-full shadow-xl border border-slate-100 p-1 flex gap-1">
                {EMOJIS.slice(0, 8).map(emo => (
                  <div key={emo} className="relative flex flex-col items-center">
                    {hoveredEmoji === emo && (
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95">
                        {REACTION_LABELS[emo]}
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setHoveredEmoji(emo)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      onClick={(e) => { e.stopPropagation(); handleReactComment(comment.id, emo); }}
                      className="hover:scale-150 transition-transform text-lg p-0.5"
                    >
                      {emo}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { setActiveReplyId(comment.id); setReplyContent(""); }} className="hover:text-blue-600 transition-colors btn-reply-trigger flex items-center gap-1"><MessageCircle size={12} /><span>{language === 'VI' ? 'Trả lời' : t('reply')}</span></button>
          <span className="font-normal text-slate-400">{getRelativeTime(comment.createdAt, t)}</span>
        </div>

        {comment.replies?.length > 0 && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="flex items-center gap-2 mt-2 ml-2 text-[13px] font-bold text-slate-500 hover:underline group"
          >
            <div className="w-8 h-[1px] bg-slate-200 group-hover:bg-slate-400" />
            {t('view_replies').replace('{{count}}', comment.replies.length)}
          </button>
        )}

        {comment.replies?.length > 0 && showReplies && (
          <div className="relative pt-1">
            {/* Vertical Line Connector */}
            <div className="absolute left-[-22px] top-0 bottom-6 w-[2px] bg-slate-100 rounded-full" />
            
            <div className="space-y-1">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="relative">
                  {/* L-Shape Connector */}
                  <div className="absolute left-[-22px] top-4 w-5 h-4 border-l-2 border-b-2 border-slate-100 rounded-bl-xl" />
                  <RenderComment comment={reply} post={post} isReply={true} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} replyContent={replyContent} setReplyContent={setReplyContent} handleSubmitReply={handleSubmitReply} handleReactComment={handleReactComment} handleDeleteComment={handleDeleteComment} handleHideComment={handleHideComment} setActionModal={setActionModal} isSubmittingComment={isSubmittingComment} currentUser={currentUser} />
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowReplies(false)}
              className="mt-2 ml-8 text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              {t('hide_replies')}
            </button>
          </div>
        )}

        {activeReplyId === comment.id && (
          <div className="mt-3 flex gap-2 animate-in slide-in-from-top-1 reply-input-container items-start">
            <div className="flex-shrink-0 mt-1">
              {isAnonEnabled ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border border-slate-100 ${currentAnonIdentity.color}`}>
                  {currentAnonIdentity.icon}
                </div>
              ) : (
                <img
                  src={userAvatar}
                  className="w-6 h-6 rounded-full object-cover border border-slate-100 shadow-sm"
                  alt="User"
                />
              )}
            </div>
                <div className="flex-1 relative">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                      if (selectedImages.length > 0) {
                        const formData = new FormData();
                        formData.append("content", replyContent);
                        formData.append("parentId", comment.id);
                        formData.append("isAnonymous", isAnonEnabled);
                        if (isAnonEnabled) formData.append("anonymousIdentity", currentAnonIdentity.name);
                        selectedImages.forEach(img => formData.append("images", img));
                        handleSubmitReply(comment.id, formData);
                      } else {
                        handleSubmitReply(comment.id, {
                          content: replyContent,
                          isAnonymous: isAnonEnabled,
                          anonymousIdentity: isAnonEnabled ? currentAnonIdentity.name : null
                        });
                      }
                    setReplyContent("");
                    setActiveReplyId(null);
                    setSelectedImages([]);
                    setImagePreviews([]);
                    setShowReplies(true);
                  }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setSelectedImages(prev => [...prev, ...files]);
                        const newPreviews = files.map(file => URL.createObjectURL(file));
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                      }}
                    />
                    {activeReplyId === comment.id && imagePreviews.length > 0 && (
                      <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded-xl overflow-x-auto">
                        {imagePreviews.map((url, idx) => (
                          <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            <img src={url} className="w-full h-full object-cover" alt="preview" />
                            <button type="button" onClick={() => {
                              setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                              setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                            }} className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl-lg"><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      ref={replyTextareaRef}
                      autoFocus
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`${t('write_reply')}${author?.fullName}...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-[13px] opacity-70 focus:opacity-100 focus:bg-white focus:border-slate-300 transition-all duration-300 resize-none min-h-[40px] outline-none overflow-hidden"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (selectedImages.length > 0) {
                            const formData = new FormData();
                            formData.append("content", replyContent);
                            formData.append("parentId", comment.id);
                            formData.append("isAnonymous", isAnonEnabled);
                            if (isAnonEnabled) formData.append("anonymousIdentity", currentAnonIdentity.name);
                            selectedImages.forEach(img => formData.append("images", img));
                            handleSubmitReply(comment.id, formData);
                          } else {
                            handleSubmitReply(comment.id, {
                              content: replyContent,
                              isAnonymous: isAnonEnabled,
                              anonymousIdentity: isAnonEnabled ? currentAnonIdentity.name : null
                            });
                          }
                          setReplyContent("");
                          setActiveReplyId(null);
                          setSelectedImages([]);
                          setImagePreviews([]);
                          setShowReplies(true);
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 pr-2 border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleAnonymousMode(!isAnonEnabled)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAnonEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnonEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                            />
                          </button>
                          <span className={`text-[11px] font-bold ${isAnonEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                            {language === 'VI' ? 'Ẩn danh' : 'Anon'}
                          </span>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"><Camera size={18} /></button>
                        <button type="button" onClick={() => setShowLocalEmojiPicker(!showLocalEmojiPicker)} className={`p-2 rounded-xl transition-all ${showLocalEmojiPicker ? 'bg-amber-100 text-amber-500 shadow-inner' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}><Smile size={18} /></button>
                      </div>
                      <button type="submit" disabled={(!replyContent.trim() && selectedImages.length === 0) || isSubmittingComment} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold disabled:bg-slate-100 disabled:text-slate-400 transition-all hover:bg-blue-700 active:scale-95 shadow-sm flex items-center gap-2">
                        {isSubmittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {language === 'VI' ? 'Gửi' : 'Send'}
                      </button>
                    </div>
                    {showLocalEmojiPicker && (
                      <div ref={localEmojiPickerRef} className="absolute top-full right-0 mt-2 p-3 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-5 gap-1.5 z-30 animate-in fade-in slide-in-from-top-2 w-[220px]">
                        {EMOJIS.map(emoji => <button key={emoji} onClick={() => addEmojiToReply(emoji)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-xl transition-all hover:scale-110 active:scale-90">{emoji}</button>)}
                      </div>
                    )}
                  </form>
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
  handleHideComment,
  isSubmittingComment = false,
  backPath = -1,
  hideHeader = false
}) => {
  const { t, language } = useLanguage();
  const REACTION_LABELS = getReactionLabels(t);
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hoveredPostEmoji, setHoveredPostEmoji] = useState(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(10);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: null, commentId: null });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [isMainAnonEnabled, setIsMainAnonEnabled] = useState(false);
  const [currentMainAnonIdentity, setCurrentMainAnonIdentity] = useState(null);

  const toggleMainAnonymousMode = (enabled) => {
    if (!enabled) {
      setIsMainAnonEnabled(false);
      setCurrentMainAnonIdentity(null);
    } else {
      setIsMainAnonEnabled(true);
      const randomId = ANONYMOUS_IDENTITIES[Math.floor(Math.random() * ANONYMOUS_IDENTITIES.length)];
      setCurrentMainAnonIdentity(randomId);
    }
  };

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

  useEffect(() => {
    if (post?.id) {
      const timer = setTimeout(() => {
        eventService.incrementPostView(post.id).catch(() => { });
      }, 3000); // Tăng view nếu người dùng xem bài viết quá 3 giây
      return () => clearTimeout(timer);
    }
  }, [post?.id]);

  const countTotalComments = useCallback((list) => {
    if (!list || list.length === 0) return 0;
    return list.reduce((total, comment) => {
      if (comment.deleted) return total;
      return total + 1 + countTotalComments(comment.replies);
    }, 0);
  }, []);

  const totalComments = useMemo(() => {
    if (Array.isArray(comments)) return countTotalComments(comments);
    return post?.commentCount || 0;
  }, [post?.commentCount, comments, countTotalComments]);

  const sortedComments = useMemo(() => {
    // Lọc bỏ bình luận đã xóa và đệ quy lọc replies của từng bình luận
    const filterDeleted = (list) => {
      if (!list) return [];
      return list
        .filter(c => !c.deleted)
        .map(c => ({
          ...c,
          replies: filterDeleted(c.replies)
        }));
    };

    let result = filterDeleted(comments);
    
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "relevant") {
      result.sort((a, b) => {
        const reactionsA = Object.keys(a.reactions || {}).length;
        const reactionsB = Object.keys(b.reactions || {}).length;
        return reactionsB - reactionsA;
      });
    }
    return result;
  }, [comments, sortBy]);

  if (loading) return (
    <div className={`flex flex-col items-center justify-center ${hideHeader ? 'py-10' : 'min-h-screen'} text-gray-500 bg-gray-50`}>
      <Loader2 className="animate-spin mb-2 text-blue-600" size={40} />
      <p className="font-medium">{t('loading_post_content')}</p>
    </div>
  );

  if (error || !post) return (
    <div className={`text-center ${hideHeader ? 'py-10' : 'py-20'} text-red-500 bg-gray-50 min-h-screen px-4`}>
      <div className="bg-white p-8 rounded-2xl shadow-sm inline-block max-w-md">
        <p className="text-lg font-semibold">{error || t('post_not_found')}</p>
        <button onClick={onRefresh} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">{t('try_again')}</button>
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
            {t('back')}
          </button>
        </div>
      )}

      <div className={`w-full bg-white ${hideHeader ? '' : 'rounded-2xl shadow-sm border border-slate-200'} h-fit relative`}>
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
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleString(language === 'VI' ? 'vi-VN' : 'en-US')}</span>
                <span>•</span><Globe size={12} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 mt-2">
          {post.eventTitle && <div className="flex items-center gap-1.5 text-blue-600 mb-3"><span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">{t('event_label')}: {post.eventTitle}</span></div>}
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

        {(postReactionList.length > 0 || totalComments > 0) && (
          <div className="px-4 py-3 flex justify-between items-center text-slate-500 text-[13px] border-b border-slate-50">
            <div className="flex items-center gap-3">
              {postReactionList.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1 items-center mr-1">
                    {Array.from(new Set(postReactionList)).slice(0, 3).map((emo, i) => <span key={i} className="text-base bg-white rounded-full shadow-sm ring-1 ring-slate-100">{emo}</span>)}
                  </div>
                  <span className="font-medium text-slate-500">{postReactionList.length} {t('reactions_count')}</span>
                </div>
              )}
            </div>
            {totalComments > 0 && (
              <div className="font-medium text-slate-500">{totalComments} {t('total_comments_count')}</div>
            )}
          </div>
        )}

        <div className="px-2 py-1 flex border-b border-slate-100">
          <div className="flex-1 relative group/post-react">
            <button
              onClick={() => handleReactPost(userReaction ? userReaction : "👍")}
              className={`w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all font-bold text-[14px] ${hasLiked ? (REACTION_COLORS[userReaction] || 'text-blue-600') : 'text-slate-600'}`}
            >
              {userReaction ? (userReaction === "👍" ? <ThumbsUp size={18} className="fill-blue-600" /> : <span className="text-lg">{userReaction}</span>) : <ThumbsUp size={18} />}
              <span>{hasLiked ? (REACTION_LABELS[userReaction] || t('liked_label')) : t('like')}</span>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 hidden group-hover/post-react:flex animate-in fade-in slide-in-from-bottom-2 z-50">
              <div className="bg-white rounded-full shadow-2xl border border-slate-100 p-1.5 flex gap-2 relative">
                {EMOJIS.slice(0, 8).map(emo => (
                  <div key={emo} className="relative flex flex-col items-center">
                    {hoveredPostEmoji === emo && (
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95">
                        {REACTION_LABELS[emo]}
                      </div>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredPostEmoji(emo)}
                      onMouseLeave={() => setHoveredPostEmoji(null)}
                      onClick={(e) => { e.stopPropagation(); handleReactPost(emo); }}
                      className="hover:scale-150 transition-transform text-2xl p-1 active:scale-90"
                    >
                      {emo}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => mainTextareaRef.current?.focus()} className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"><MessageCircle size={18} /> {t('comment')}</button>
          <button
            onClick={() => {
              const url = `${window.location.origin}/posts/${post.id}`;
              navigator.clipboard.writeText(url);
              toast.success(t('copy_link_success'));
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"
          >
            <Share2 size={18} /> {t('share')}
          </button>
        </div>

        <div className="p-4 bg-slate-50/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('comment')}</h4>
            
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {sortBy === "relevant" ? t('sort_relevant') : sortBy === "newest" ? t('sort_newest') : t('sort_all')}
                <MoreHorizontal size={14} className="rotate-90" />
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-40"
                  >
                    {[
                      { id: 'relevant', label: t('sort_relevant'), desc: t('sort_relevant_desc') },
                      { id: 'newest', label: t('sort_newest'), desc: t('sort_newest_desc') },
                      { id: 'all', label: t('sort_all'), desc: t('sort_all_desc') }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id); setShowSortDropdown(false); }}
                        className={`w-full text-left p-3 rounded-xl transition-all ${sortBy === opt.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`text-[13px] font-bold ${sortBy === opt.id ? 'text-blue-600' : 'text-slate-800'}`}>{opt.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{opt.desc}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {post.allowComments ? (
            <div className="space-y-6">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1">
                  {isMainAnonEnabled ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm border border-slate-100 ${currentMainAnonIdentity.color}`}>
                      {currentMainAnonIdentity.icon}
                    </div>
                  ) : (
                    <img
                      src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || 'User'}`}
                      className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                      alt="User"
                    />
                  )}
                </div>
                <div className="flex-1 relative">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                      if (selectedImages.length > 0) {
                        const formData = new FormData();
                        formData.append("content", commentContent);
                        formData.append("isAnonymous", isMainAnonEnabled);
                        if (isMainAnonEnabled) formData.append("anonymousIdentity", currentMainAnonIdentity.name);
                        selectedImages.forEach(img => formData.append("images", img));
                        handleSubmitComment(formData);
                      } else {
                        handleSubmitComment({
                          content: commentContent,
                          isAnonymous: isMainAnonEnabled,
                          anonymousIdentity: isMainAnonEnabled ? currentMainAnonIdentity.name : null
                        });
                      }
                      setCommentContent("");
                      setSelectedImages([]);
                      setImagePreviews([]);
                      setIsMainAnonEnabled(false);
                    }}>
                    {imagePreviews.length > 0 && (
                      <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded-xl overflow-x-auto">
                        {imagePreviews.map((url, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            <img src={url} className="w-full h-full object-cover" alt="preview" />
                            <button type="button" onClick={() => {
                              setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                              setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                            }} className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl-lg"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      ref={mainTextareaRef}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder={t('write_comment')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm opacity-70 focus:opacity-100 focus:bg-white focus:border-slate-300 transition-all duration-300 resize-none min-h-[44px] outline-none overflow-hidden"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (selectedImages.length > 0) {
                            const formData = new FormData();
                            formData.append("content", commentContent);
                            formData.append("isAnonymous", isMainAnonEnabled);
                            if (isMainAnonEnabled) formData.append("anonymousIdentity", currentMainAnonIdentity.name);
                            selectedImages.forEach(img => formData.append("images", img));
                            handleSubmitComment(formData);
                          } else {
                            handleSubmitComment({
                              content: commentContent,
                              isAnonymous: isMainAnonEnabled,
                              anonymousIdentity: isMainAnonEnabled ? currentMainAnonIdentity.name : null
                            });
                          }
                          setCommentContent("");
                          setSelectedImages([]);
                          setImagePreviews([]);
                          setIsMainAnonEnabled(false);
                        }
                      }}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setSelectedImages(prev => [...prev, ...files]);
                        const newPreviews = files.map(file => URL.createObjectURL(file));
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                      }}
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 pr-2 border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleMainAnonymousMode(!isMainAnonEnabled)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isMainAnonEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isMainAnonEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                          <span className={`text-[13px] font-bold ${isMainAnonEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                            {language === 'VI' ? 'Chế độ ẩn danh' : 'Anonymous Mode'}
                          </span>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"><Camera size={20} /></button>
                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-amber-100 text-amber-500 shadow-inner' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}><Smile size={20} /></button>
                      </div>
                      <button type="submit" disabled={(!commentContent.trim() && selectedImages.length === 0) || isSubmittingComment} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400 transition-all hover:bg-blue-700 active:scale-95 shadow-sm flex items-center gap-2">
                        {isSubmittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {language === 'VI' ? 'Đăng bình luận' : 'Post'}
                      </button>
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
                {sortedComments.length > 0 ? (
                  <>
                    {sortedComments.slice(0, visibleCommentsCount).map((comment) => (
                      <RenderComment key={comment.id} comment={comment} post={post} activeReplyId={activeReplyId} setActiveReplyId={setActiveReplyId} replyContent={replyContent} setReplyContent={setReplyContent} handleSubmitReply={handleSubmitReply} handleReactComment={handleReactComment} handleDeleteComment={handleDeleteComment} handleHideComment={handleHideComment} setActionModal={setActionModal} isSubmittingComment={isSubmittingComment} currentUser={currentUser} setFullscreenImage={setFullscreenImage} />
                    ))}
                    
                    {sortedComments.length > visibleCommentsCount && (
                      <button 
                        onClick={() => setVisibleCommentsCount(prev => prev + 10)}
                        className="w-full py-3 mt-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-white rounded-2xl transition-all border border-dashed border-slate-200 hover:border-blue-200"
                      >
                        {t('view_more_comments')} ({sortedComments.length - visibleCommentsCount})
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><MessageCircle className="text-slate-300" size={32} /></div><p className="text-slate-400 text-sm italic">{t('be_first_comment')}</p></div>
                )}
              </div>
            </div>
          ) : (<div className="text-center py-6 bg-slate-100 rounded-2xl border border-dashed border-slate-200"><p className="text-slate-500 text-sm font-medium">{t('comments_disabled')}</p></div>)}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {actionModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                {actionModal.type === 'delete' ? <XCircle size={40} /> : <Eye size={40} className="opacity-60" />}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                {actionModal.type === 'delete' ? t('delete_comment_confirm_title') : t('hide_comment_confirm_title')}
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 px-4">
                {actionModal.type === 'delete' ? t('delete_comment_confirm_desc') : t('hide_comment_confirm_desc')}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isProcessingAction}
                  onClick={async () => {
                    const { type, commentId } = actionModal;
                    setActionModal({ show: false, type: null, commentId: null });
                    
                    if (type === 'delete') {
                      toast.success(language === 'VI' ? "Xóa thành công" : "Deleted successfully");
                      await handleDeleteComment(commentId);
                    } else {
                      toast.success(language === 'VI' ? "Đã ẩn bình luận" : "Comment hidden");
                      await handleHideComment(commentId);
                    }
                  }}
                  className={`w-full py-4 ${actionModal.type === 'delete' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-800 hover:bg-slate-900'} text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
                >
                  {isProcessingAction && <Loader2 size={16} className="animate-spin" />}
                  {actionModal.type === 'delete' ? t('delete') : (language === 'VI' ? 'Ẩn ngay' : 'Hide Now')}
                </button>
                <button
                  onClick={() => setActionModal({ show: false, type: null, commentId: null })}
                  className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10"
              onClick={() => setFullscreenImage(null)}
            >
              <X size={24} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostDetailManagement;
