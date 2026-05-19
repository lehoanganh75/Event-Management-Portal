import React from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

const CommentItem = ({
  comment,
  postAuthorId,
  isReply = false,
  t,
  handleReactComment,
  setActiveReplyId,
}) => {
  const avatar =
    !comment.commenter?.avatarUrl ||
      comment.commenter.avatarUrl ===
      "default-avatar-url.png"
      ? `https://api.dicebear.com/7.x/initials/svg?seed=${comment.commenter?.fullName}`
      : comment.commenter.avatarUrl;

  const reactions = comment.reactions || {};
  const hasLiked = false; // Need to pass currentUser to check this

  return (
    <div
      className={`flex gap-3 ${isReply
          ? "mt-3 pl-4 border-l border-slate-200"
          : "mt-5"
        }`}
    >
      {/* Avatar */}
      <img
        src={avatar}
        alt="avatar"
        className={`
          ${isReply
            ? "w-8 h-8"
            : "w-10 h-10"
          }
          rounded-full
          object-cover
          border border-slate-200
          shrink-0 shadow-sm
        `}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className="
            bg-slate-50
            hover:bg-slate-100/80
            transition-colors
            rounded-2xl
            px-4
            py-3
            border border-slate-100
            shadow-sm
          "
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[13px] text-slate-900">
                {comment.commenter?.fullName ||
                  "Người dùng"}
              </p>

              {String(comment.commenter?.id) ===
                String(postAuthorId) && (
                  <span
                    className="
                    bg-[#1E40AF]
                    text-white
                    text-[9px]
                    px-2 py-0.5
                    rounded-full
                    font-black
                    uppercase
                    tracking-wide
                  "
                  >
                    Tác giả
                  </span>
                )}
            </div>

            <button
              className="
                text-slate-400
                hover:text-slate-600
                transition-colors
                shrink-0
              "
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Comment */}
          <p
            className="
              text-[14px]
              text-slate-700
              leading-relaxed
              break-words
              font-medium
            "
          >
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div
          className="
            flex items-center gap-4
            text-[12px]
            font-bold
            text-slate-500
            mt-2
            ml-1
            uppercase
            tracking-wider
          "
        >
          <button
            onClick={() => handleReactComment?.(comment.id, "👍")}
            className="
              flex items-center gap-1
              hover:text-[#1E40AF]
              transition-colors
            "
          >
            <Heart size={14} />
            <span>
              {t ? "Thích" : "Thích"}
            </span>
          </button>

          <button
            onClick={() => setActiveReplyId?.(comment.id)}
            className="
              flex items-center gap-1
              hover:text-[#1E40AF]
              transition-colors
            "
          >
            <MessageCircle size={14} />
            <span>
              {t ? "Phản hồi" : "Phản hồi"}
            </span>
          </button>

          <span className="text-slate-400 text-[10px] lowercase font-medium">
            1 {t ? t("hour_ago") : "giờ trước"}
          </span>
        </div>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postAuthorId={postAuthorId}
                isReply={true}
                t={t}
                handleReactComment={handleReactComment}
                setActiveReplyId={setActiveReplyId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
