import React, { useState, useRef, useEffect } from "react";
import { ThumbsUp, MessageCircle, Share2, Copy, Facebook } from "lucide-react";

const PostStatsBar = ({
  post,
  totalComments,
  handleReactPost,
  userReaction,
  hasLiked,
  emojis,
  reactionLabels,
  reactionColors,
  t,
  mainTextareaRef,
  hoveredPostEmoji,
  setHoveredPostEmoji
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const postReactions = post.reactions || {};
  const postReactionList = Object.values(postReactions);

  return (
    <>
      {(postReactionList.length > 0 || totalComments > 0) && (
        <div className="px-4 py-3 flex justify-between items-center text-slate-500 text-[13px] border-b border-slate-50">
          <div className="flex items-center gap-3">
            {postReactionList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1 items-center mr-1">
                  {Array.from(new Set(postReactionList)).slice(0, 3).map((emo, i) => (
                    <span key={i} className="text-base bg-white rounded-full shadow-sm ring-1 ring-slate-100">{emo}</span>
                  ))}
                </div>
                <span className="font-medium text-slate-500">{postReactionList.length} {"người tương tác"}</span>
              </div>
            )}
          </div>
          {totalComments > 0 && (
            <div className="font-medium text-slate-500">{totalComments} {"bình luận"}</div>
          )}
        </div>
      )}

      <div className="px-2 py-1 flex border-b border-slate-100">
        <div className="flex-1 relative group/post-react">
          <button
            onClick={() => handleReactPost(userReaction ? userReaction : "👍")}
            className={`w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all font-bold text-[14px] ${hasLiked ? (reactionColors[userReaction] || 'text-blue-600') : 'text-slate-600'
              }`}
          >
            {userReaction ? (
              userReaction === "👍" ? <ThumbsUp size={18} className="fill-blue-600" /> : <span className="text-lg">{userReaction}</span>
            ) : <ThumbsUp size={18} />}
            <span>{hasLiked ? (reactionLabels[userReaction] || "Đã thích") : "Thích"}</span>
          </button>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 hidden group-hover/post-react:flex animate-in fade-in slide-in-from-bottom-2 z-50">
            <div className="bg-white rounded-full shadow-2xl border border-slate-100 p-1.5 flex gap-2 relative">
              {emojis.slice(0, 8).map(emo => (
                <div key={emo} className="relative flex flex-col items-center">
                  {hoveredPostEmoji === emo && (
                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95">
                      {reactionLabels[emo]}
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

        <button
          onClick={() => mainTextareaRef.current?.focus()}
          className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"
        >
          <MessageCircle size={18} /> {"Bình luận"}
        </button>

        <div className="flex-1 relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-full flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-xl transition-all text-slate-600 font-bold text-[14px]"
          >
            <Share2 size={18} /> {"Chia sẻ"}
          </button>

          {showShareMenu && (
            <div
              ref={shareMenuRef}
              className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 min-w-[180px] z-50 animate-in fade-in slide-in-from-bottom-2"
            >
              <button
                onClick={() => {
                  const url = `${window.location.origin}/posts/${post.id}`;
                  navigator.clipboard.writeText(url);
                  import("react-toastify").then(({ toast }) => toast.success("Đã sao chép liên kết bài viết!"));
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Copy size={16} className="text-slate-400" />
                <span>Sao chép liên kết</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/posts/${post.id}`;
                  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                  window.open(fbUrl, "_blank");
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left border-t border-slate-50"
              >
                <Facebook size={16} className="text-[#1877F2] fill-[#1877F2]" />
                <span>Chia sẻ lên Facebook</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PostStatsBar;
