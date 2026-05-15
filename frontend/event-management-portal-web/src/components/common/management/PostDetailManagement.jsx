import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import eventService from "../../../services/eventService";
import { useLanguage } from "../../../context/LanguageContext";

// Sub-components
import PostHeader from "./post-detail/PostHeader";
import PostContent from "./post-detail/PostContent";
import PostStatsBar from "./post-detail/PostStatsBar";
import PostComments from "./post-detail/PostComments";
import PostModals from "./post-detail/PostModals";

// Constants & Utils
import {
  EMOJIS,
  getReactionLabels,
  REACTION_COLORS,
  ANONYMOUS_IDENTITIES,
  DEFAULT_AVATAR,
  getRelativeTime
} from "./post-detail/constants";

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
  hideHeader = false,
  onRefresh
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const REACTION_LABELS = useMemo(() => getReactionLabels(t), [t]);

  // State
  const [commentContent, setCommentContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hoveredPostEmoji, setHoveredPostEmoji] = useState(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(10);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: null, commentId: null });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Anonymous identity management
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
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (mainTextareaRef.current) {
      mainTextareaRef.current.style.height = 'inherit';
      mainTextareaRef.current.style.height = `${mainTextareaRef.current.scrollHeight}px`;
    }
  }, [commentContent]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (!event.target.closest('.reply-input-container') && !event.target.closest('.btn-reply-trigger')) {
        setActiveReplyId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // View increment logic
  useEffect(() => {
    if (post?.id) {
      const timer = setTimeout(() => {
        eventService.incrementPostView(post.id).catch(() => { });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [post?.id]);

  // Comments calculation
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

  // Sorting logic
  const sortedComments = useMemo(() => {
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
  const userReaction = currentUser ? postReactions[currentUser.id] : null;
  const hasLiked = !!userReaction;

  return (
    <div className={`${hideHeader ? 'w-full' : 'bg-slate-50 min-h-screen p-6 flex flex-col items-center'}`}>
      <PostHeader
        post={post}
        navigate={navigate}
        backPath={backPath}
        hideHeader={hideHeader}
        getRelativeTime={getRelativeTime}
        t={t}
        defaultAvatar={DEFAULT_AVATAR}
      />

      <div className={`w-full bg-white ${hideHeader ? '' : 'rounded-2xl shadow-sm border border-slate-200'} h-fit relative`}>
        <PostContent
          post={post}
          setFullscreenImage={setFullscreenImage}
          t={t}
        />

        <PostStatsBar
          post={post}
          totalComments={totalComments}
          handleReactPost={handleReactPost}
          userReaction={userReaction}
          hasLiked={hasLiked}
          emojis={EMOJIS}
          reactionLabels={REACTION_LABELS}
          reactionColors={REACTION_COLORS}
          t={t}
          mainTextareaRef={mainTextareaRef}
          hoveredPostEmoji={hoveredPostEmoji}
          setHoveredPostEmoji={setHoveredPostEmoji}
        />

        <PostComments
          post={post}
          sortedComments={sortedComments}
          currentUser={currentUser}
          handleSubmitComment={handleSubmitComment}
          commentContent={commentContent}
          setCommentContent={setCommentContent}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          isMainAnonEnabled={isMainAnonEnabled}
          toggleMainAnonymousMode={toggleMainAnonymousMode}
          currentMainAnonIdentity={currentMainAnonIdentity}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showSortDropdown={showSortDropdown}
          setShowSortDropdown={setShowSortDropdown}
          visibleCommentsCount={visibleCommentsCount}
          setVisibleCommentsCount={setVisibleCommentsCount}
          t={t}
          language={language}
          emojis={EMOJIS}
          anonymousIdentities={ANONYMOUS_IDENTITIES}
          mainTextareaRef={mainTextareaRef}
          emojiPickerRef={emojiPickerRef}
          fileInputRef={fileInputRef}
          activeReplyId={activeReplyId}
          setActiveReplyId={setActiveReplyId}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          handleSubmitReply={handleSubmitReply}
          handleReactComment={handleReactComment}
          setActionModal={setActionModal}
          isSubmittingComment={isSubmittingComment}
          setFullscreenImage={setFullscreenImage}
          getRelativeTime={getRelativeTime}
          reactionLabels={REACTION_LABELS}
          reactionColors={REACTION_COLORS}
        />
      </div>

      <PostModals
        fullscreenImage={fullscreenImage}
        setFullscreenImage={setFullscreenImage}
        actionModal={actionModal}
        setActionModal={setActionModal}
        isProcessingAction={isProcessingAction}
        handleDeleteComment={handleDeleteComment}
        handleHideComment={handleHideComment}
        t={t}
        language={language}
      />
    </div>
  );
};

export default PostDetailManagement;
