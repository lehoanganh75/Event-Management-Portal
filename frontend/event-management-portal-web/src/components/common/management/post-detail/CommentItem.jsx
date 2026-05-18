import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  XCircle,
  Eye,
  Camera,
  Smile,
  Loader2,
  Send,
  X,
} from "lucide-react";

const CommentItem = ({
  comment,
  post,
  isReply = false,
  activeReplyId,
  setActiveReplyId,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  handleReactComment,
  setActionModal,
  isSubmittingComment,
  currentUser,
  setFullscreenImage,
  t,
  language,
  emojis,
  reactionLabels,
  reactionColors,
  getRelativeTime,
  anonymousIdentities,
  isAnonEnabled,
  toggleAnonymousMode,
  currentAnonIdentity,
}) => {
  const [showLocalEmojiPicker, setShowLocalEmojiPicker] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const localEmojiPickerRef = useRef(null);
  const replyTextareaRef = useRef(null);
  const localFileInputRef = useRef(null);

  const [localSelectedImages, setLocalSelectedImages] = useState([]);
  const [localImagePreviews, setLocalImagePreviews] = useState([]);

  useEffect(() => {
    if (replyTextareaRef.current && activeReplyId === comment.id) {
      replyTextareaRef.current.style.height = "inherit";
      replyTextareaRef.current.style.height = `${replyTextareaRef.current.scrollHeight}px`;
    }
  }, [replyContent, activeReplyId, comment.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        localEmojiPickerRef.current &&
        !localEmojiPickerRef.current.contains(event.target)
      ) {
        setShowLocalEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAnon = comment.isAnonymous || comment.anonymous;

  const author = isAnon
    ? {
      fullName:
        comment.anonymousIdentity ||
        (language === "VI"
          ? "Người dùng ẩn danh"
          : "Anonymous User"),
    }
    : comment.commenter || comment.author || (String(comment.commenterAccountId) === String(currentUser?.id) ? currentUser : null);

  const avatar = isAnon
    ? null
    : author?.avatarUrl &&
      author.avatarUrl !== "default-avatar-url.png"
      ? author.avatarUrl
      : `https://api.dicebear.com/7.x/initials/svg?seed=${author?.fullName || "User"
      }`;

  const reactions = comment.reactions || {};
  const reactionList = Object.values(reactions);

  const userCommentReaction = currentUser
    ? reactions[currentUser.id]
    : null;

  const hasLikedComment = !!userCommentReaction;

  return (
    <div className={`flex gap-3 ${isReply ? "ml-8 mt-3" : "mt-5"}`}>
      {/* Avatar */}
      {isAnon ? (
        <div
          className={`${isReply ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
            } rounded-xl flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-600`}
        >
          👤
        </div>
      ) : (
        <img
          src={avatar}
          alt="avatar"
          className={`${isReply ? "w-8 h-8" : "w-10 h-10"
            } rounded-xl object-cover border border-slate-200`}
        />
      )}

      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className="flex items-start gap-2 group">
          <div className="bg-slate-100 rounded-2xl px-4 py-3 max-w-[85%] border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[13px] font-semibold text-slate-800">
                {author?.fullName || "User"}
              </p>

              {String(author?.id) === String(post?.author?.id) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {t("author_label")}
                </span>
              )}
            </div>

            <p className="text-[14px] leading-relaxed text-slate-700 break-words">
              {comment.content}
            </p>

            {/* Images */}
            {comment.imageUrls?.length > 0 && (
              <div className="mt-3 grid gap-2">
                {comment.imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-slate-200 cursor-pointer"
                    onClick={() => setFullscreenImage(url)}
                  >
                    <img
                      src={url}
                      alt="comment"
                      className="w-full object-cover hover:opacity-95 transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menu */}
          {(String(currentUser?.id) ===
            String(
              comment.commenterAccountId ||
              (comment.commenter || comment.author)?.id
            ) ||
            String(currentUser?.id) ===
            String(post?.author?.id)) && (
              <button className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <MoreHorizontal size={16} />
              </button>
            )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 ml-2 text-[12px]">
          <button
            onClick={() =>
              handleReactComment(
                comment.id,
                userCommentReaction || "👍"
              )
            }
            className={`flex items-center gap-1 transition ${hasLikedComment
              ? "text-blue-600 font-medium"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            <ThumbsUp size={13} />
            {hasLikedComment ? t("liked_label") : t("like")}
          </button>

          <button
            onClick={() => {
              setActiveReplyId(comment.id);
              setReplyContent("");
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition btn-reply-trigger"
          >
            <MessageCircle size={13} />
            {language === "VI" ? "Trả lời" : t("reply")}
          </button>

          <span className="text-slate-400">
            {getRelativeTime(comment.createdAt, t)}
          </span>
        </div>

        {/* Replies */}
        {comment.replies?.length > 0 && !showReplies && (
          <button
            onClick={() => setShowReplies(true)}
            className="mt-2 ml-2 text-[13px] text-slate-500 hover:text-slate-700 font-medium"
          >
            {t("view_replies").replace(
              "{{count}}",
              comment.replies.length
            )}
          </button>
        )}

        {((comment.replies?.length > 0 && showReplies) || isSubmittingLocal) && (
          <div className="mt-2 space-y-1 border-l border-slate-200 pl-4">
            {comment.replies?.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                post={post}
                isReply={true}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleSubmitReply={handleSubmitReply}
                handleReactComment={handleReactComment}
                setActionModal={setActionModal}
                isSubmittingComment={isSubmittingComment}
                currentUser={currentUser}
                setFullscreenImage={setFullscreenImage}
                t={t}
                language={language}
                emojis={emojis}
                reactionLabels={reactionLabels}
                reactionColors={reactionColors}
                getRelativeTime={getRelativeTime}
                anonymousIdentities={anonymousIdentities}
                isAnonEnabled={isAnonEnabled}
                toggleAnonymousMode={toggleAnonymousMode}
                currentAnonIdentity={currentAnonIdentity}
              />
            ))}

            {/* Custom local loading reply placeholder */}
            {isSubmittingLocal && (
              <div className="flex gap-3 ml-8 mt-3 animate-pulse opacity-70">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || "User"}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="bg-slate-50 rounded-2xl px-4 py-3 max-w-[85%] border border-slate-200">
                    <p className="text-[13px] font-semibold text-slate-500">
                      {currentUser?.fullName || "Bạn"}
                    </p>
                    <p className="text-[13px] text-slate-400 mt-1 italic flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-slate-400" />
                      {language === "VI" ? "Đang gửi phản hồi..." : "Sending reply..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(false)}
                className="ml-2 text-[12px] text-slate-400 hover:text-slate-600 block mt-2"
              >
                {t("hide_replies")}
              </button>
            )}
          </div>
        )}

        {/* Reply Input */}
        {activeReplyId === comment.id && (
          <div className="mt-3 flex gap-2 reply-input-container">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={
                  currentUser?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || "User"
                  }`
                }
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <input
                type="file"
                ref={localFileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setLocalSelectedImages((prev) => [...prev, ...files]);
                  setLocalImagePreviews((prev) => [
                    ...prev,
                    ...files.map((file) => URL.createObjectURL(file)),
                  ]);
                  e.target.value = "";
                }}
              />

              {localImagePreviews.length > 0 && (
                <div className="flex gap-2 mb-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg overflow-x-auto">
                  {localImagePreviews.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white group"
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLocalSelectedImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          setLocalImagePreviews((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                        }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/55 text-white rounded-md transition flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={replyTextareaRef}
                autoFocus
                value={replyContent}
                onChange={(e) =>
                  setReplyContent(e.target.value)
                }
                placeholder={`${t("write_reply")} ${author?.fullName}...`}
                className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:border-slate-400 min-h-[42px]"
              />

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => localFileInputRef.current?.click()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100"
                  >
                    <Camera size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowLocalEmojiPicker(
                        !showLocalEmojiPicker
                      )
                    }
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100"
                  >
                    <Smile size={17} />
                  </button>
                </div>

                <button
                  onClick={async () => {
                    const contentToSend = replyContent;
                    const imagesToSend = localSelectedImages;

                    setReplyContent("");
                    setLocalSelectedImages([]);
                    setLocalImagePreviews([]);
                    setActiveReplyId(null);
                    setShowReplies(true);
                    setIsSubmittingLocal(true);

                    try {
                      if (imagesToSend.length > 0) {
                        const formData = new FormData();
                        formData.append("content", contentToSend);
                        formData.append("parentId", comment.id);
                        imagesToSend.forEach((img) =>
                          formData.append("images", img)
                        );
                        await handleSubmitReply(comment.id, formData);
                      } else {
                        await handleSubmitReply(comment.id, {
                          content: contentToSend,
                          parentId: comment.id,
                        });
                      }
                    } catch (err) {
                      // Handled by parent toast
                    } finally {
                      setIsSubmittingLocal(false);
                    }
                  }}
                  disabled={
                    (!replyContent.trim() && localSelectedImages.length === 0) ||
                    isSubmittingLocal
                  }
                  className="px-4 py-2 rounded-xl bg-[#1E40AF] text-white text-sm font-medium hover:bg-[#1d4ed8] disabled:bg-slate-200 disabled:text-slate-500 transition"
                >
                  {isSubmittingLocal ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={14} />
                      {language === "VI" ? "Gửi" : "Send"}
                    </div>
                  )}
                </button>
              </div>

              {/* Emoji Picker */}
              {showLocalEmojiPicker && (
                <div
                  ref={localEmojiPickerRef}
                  className="mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-lg grid grid-cols-5 gap-2 w-[220px]"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() =>
                        setReplyContent(
                          (prev) => prev + emoji
                        )
                      }
                      className="w-9 h-9 rounded-xl hover:bg-slate-100 text-xl transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
