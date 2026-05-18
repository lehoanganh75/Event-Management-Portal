import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  Camera,
  Smile,
  Loader2,
  Send,
  X,
  MessageCircle,
} from "lucide-react";
import CommentItem from "./CommentItem";

const PostComments = ({
  post,
  sortedComments,
  currentUser,
  handleSubmitComment,
  commentContent,
  setCommentContent,
  selectedImages,
  setSelectedImages,
  imagePreviews,
  setImagePreviews,
  isMainAnonEnabled,
  toggleMainAnonymousMode,
  currentMainAnonIdentity,
  showEmojiPicker,
  setShowEmojiPicker,
  sortBy,
  setSortBy,
  showSortDropdown,
  setShowSortDropdown,
  visibleCommentsCount,
  setVisibleCommentsCount,
  t,
  language,
  emojis,
  anonymousIdentities,
  mainTextareaRef,
  emojiPickerRef,
  fileInputRef,
  activeReplyId,
  setActiveReplyId,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  handleReactComment,
  setActionModal,
  isSubmittingComment,
  setFullscreenImage,
  getRelativeTime,
  reactionLabels,
  reactionColors,
}) => {
  const addEmojiToComment = (emoji) => {
    setCommentContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800">
          {t("comment")}
        </h4>

        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
          >
            {sortBy === "relevant"
              ? t("sort_relevant")
              : sortBy === "newest"
                ? t("sort_newest")
                : t("sort_all")}
            <MoreHorizontal size={15} className="rotate-90" />
          </button>

          <AnimatePresence>
            {showSortDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute right-0 top-full mt-2
                  w-72
                  bg-white
                  rounded-2xl
                  border border-slate-200
                  shadow-lg
                  p-2
                  z-40
                "
              >
                {[
                  {
                    id: "relevant",
                    label: t("sort_relevant"),
                    desc: t("sort_relevant_desc"),
                  },
                  {
                    id: "newest",
                    label: t("sort_newest"),
                    desc: t("sort_newest_desc"),
                  },
                  {
                    id: "all",
                    label: t("sort_all"),
                    desc: t("sort_all_desc"),
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortBy(opt.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition ${sortBy === opt.id
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`text-sm font-medium ${sortBy === opt.id
                        ? "text-[#1E40AF]"
                        : "text-slate-800"
                        }`}
                    >
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {post.allowComments ? (
        <div className="space-y-6">
          {/* Comment Input */}
          <div className="flex gap-3 items-start">
            <div className="shrink-0 mt-1">
              {isMainAnonEnabled ? (
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border border-slate-200 ${currentMainAnonIdentity.color}`}
                >
                  {currentMainAnonIdentity.icon}
                </div>
              ) : (
                <img
                  src={
                    currentUser?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || "User"
                    }`
                  }
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  alt="User"
                />
              )}
            </div>

            <div className="flex-1 relative text-left">
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  if (selectedImages.length > 0) {
                    const formData = new FormData();
                    formData.append("content", commentContent);
                    formData.append("isAnonymous", isMainAnonEnabled);

                    if (isMainAnonEnabled) {
                      formData.append(
                        "anonymousIdentity",
                        currentMainAnonIdentity.name
                      );
                    }

                    selectedImages.forEach((img) =>
                      formData.append("images", img)
                    );

                    handleSubmitComment(formData);
                  } else {
                    handleSubmitComment({
                      content: commentContent,
                      isAnonymous: isMainAnonEnabled,
                      anonymousIdentity: isMainAnonEnabled
                        ? currentMainAnonIdentity.name
                        : null,
                    });
                  }

                  setCommentContent("");
                  setSelectedImages([]);
                  setImagePreviews([]);
                  toggleMainAnonymousMode(false);
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setSelectedImages((prev) => [...prev, ...files]);
                    setImagePreviews((prev) => [
                      ...prev,
                      ...files.map((file) => URL.createObjectURL(file)),
                    ]);
                  }}
                />

                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mb-3 p-2 bg-white border border-slate-200 rounded-xl overflow-x-auto">
                    {imagePreviews.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 group"
                      >
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            setImagePreviews((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  ref={mainTextareaRef}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={t("write_comment")}
                  className="
                    w-full
                    min-h-[52px]
                    px-4 py-3
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    text-sm text-slate-700
                    resize-none
                    outline-none
                    focus:border-[#1E40AF]
                    transition
                  "
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form.requestSubmit();
                    }
                  }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    {/* Anonymous */}
                    <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          toggleMainAnonymousMode(!isMainAnonEnabled)
                        }
                        className={`relative inline-flex h-5 w-9 rounded-full transition ${isMainAnonEnabled ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${isMainAnonEnabled
                            ? "translate-x-4"
                            : "translate-x-0"
                            }`}
                        />
                      </button>

                      <span
                        className={`text-xs font-medium ${isMainAnonEnabled
                          ? "text-emerald-600"
                          : "text-slate-400"
                          }`}
                      >
                        {language === "VI" ? "Ẩn danh" : "Anonymous"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-[#1E40AF] transition"
                    >
                      <Camera size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${showEmojiPicker
                        ? "bg-amber-50 text-amber-500"
                        : "text-slate-500 hover:bg-white hover:text-amber-500"
                        }`}
                    >
                      <Smile size={18} />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      (!commentContent.trim() && selectedImages.length === 0) ||
                      isSubmittingComment
                    }
                    className="
                      h-10 px-5
                      rounded-xl
                      bg-[#1E40AF]
                      text-white
                      text-sm font-medium
                      hover:bg-blue-800
                      disabled:bg-slate-200
                      disabled:text-slate-400
                      transition
                      flex items-center gap-2
                    "
                  >
                    {isSubmittingComment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {language === "VI" ? "Gửi" : "Send"}
                  </button>
                </div>

                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="
                      absolute top-full left-0 mt-2
                      p-3
                      bg-white
                      rounded-2xl
                      border border-slate-200
                      shadow-lg
                      grid grid-cols-5 gap-2
                      z-30
                      w-[230px]
                    "
                  >
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmojiToComment(emoji)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl text-xl transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-2 mt-8">
            {/* Show top-level submitting placeholder at the top of the list! */}
            {isSubmittingComment && (
              <div className="flex gap-3 mb-4 animate-pulse opacity-85 text-left">
                <div className="shrink-0 mt-1">
                  {isMainAnonEnabled ? (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border border-slate-200 ${currentMainAnonIdentity.color}`}
                    >
                      {currentMainAnonIdentity.icon}
                    </div>
                  ) : (
                    <img
                      src={
                        currentUser?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName || "User"}`
                      }
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      alt="User"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] border border-slate-200 shadow-sm">
                    <p className="text-[13px] font-semibold text-slate-700">
                      {isMainAnonEnabled ? currentMainAnonIdentity.name : (currentUser?.fullName || "Bạn")}
                    </p>
                    <p className="text-[13px] text-slate-400 mt-1 italic flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-[#1E40AF]" />
                      {language === "VI" ? "Đang gửi bình luận và kiểm duyệt AI..." : "Sending comment and verifying AI..."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {sortedComments
              .slice(0, visibleCommentsCount)
              .map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  post={post}
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
                  isAnonEnabled={isMainAnonEnabled}
                  toggleAnonymousMode={toggleMainAnonymousMode}
                  currentAnonIdentity={currentMainAnonIdentity}
                />
              ))}

            {sortedComments.length > visibleCommentsCount && (
              <button
                onClick={() =>
                  setVisibleCommentsCount((prev) => prev + 10)
                }
                className="w-full h-11 text-sm font-medium text-[#1E40AF] hover:bg-blue-50 rounded-xl transition mt-4"
              >
                {t("load_more_comments")}
              </button>
            )}

            {sortedComments.length === 0 && !isSubmittingComment && (
              <div className="py-10 text-center">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <MessageCircle size={28} />
                </div>
                <p className="text-sm text-slate-400">
                  {t("no_comments_yet")}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-400">{t("comments_disabled")}</p>
        </div>
      )}
    </div>
  );
};

export default PostComments;
