import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Newspaper } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";
import { createStompClient } from "../../utils/socket";
import { useLanguage } from "../../context/LanguageContext";

// Components
import NewsBanner from "../../components/events/news/NewsBanner";
import NewsSidebar from "../../components/events/news/NewsSidebar";

const updateCommentInTree = (list, commentId, updateFn) => {
  return list.map(item => {
    if (String(item.id) === String(commentId)) return updateFn(item);
    if (item.replies?.length > 0) return { ...item, replies: updateCommentInTree(item.replies, commentId, updateFn) };
    return item;
  });
};

const removeCommentFromTree = (list, commentId) => {
  return list.filter(item => String(item.id) !== String(commentId)).map(item => {
    if (item.replies?.length > 0) return { ...item, replies: removeCommentFromTree(item.replies, commentId) };
    return item;
  });
};

export default function NewsPage() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState("all");
  const [postComments, setPostComments] = useState({}); // { postId: comments[] }
  const [submittingComments, setSubmittingComments] = useState({}); // { postId: boolean }
  const [loadingComments, setLoadingComments] = useState({}); // { postId: boolean }
  const [eventSearch, setEventSearch] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const filteredEvents = useMemo(() => {
    return events.filter(e => e.title.toLowerCase().includes(eventSearch.toLowerCase()));
  }, [events, eventSearch]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getAllPosts();

      const allPosts = Array.isArray(res.data) ? res.data : [];
      setPosts(allPosts);

      // Extract unique events from posts
      const eventMap = new Map();
      const initialComments = {};

      allPosts.forEach(post => {
        if (post.eventId && !eventMap.has(post.eventId)) {
          eventMap.set(post.eventId, {
            id: post.eventId,
            title: post.eventTitle || "Sự kiện không tên",
            type: post.postType
          });
        }
        // Initialize comments from post if present
        if (post.comments) {
          initialComments[post.id] = post.comments;
        }
      });

      setEvents(Array.from(eventMap.values()));
      setPostComments(prev => ({ ...prev, ...initialComments }));

    } catch (error) {
      console.error("Error loading news data:", error);
      toast.error("Không thể tải danh sách tin tức");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComments = async (postId) => {
    if (loadingComments[postId]) return;
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await eventService.getComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: res.data || [] }));
    } catch (err) {
      console.error(`Error loading comments for post ${postId}:`, err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- WebSocket Realtime ---
  useEffect(() => {
    if (loading || posts.length === 0) return;

    const stompClient = createStompClient(() => {
      // Subscribe to all posts
      posts.forEach(post => {
        stompClient.subscribe(`/topic/posts/${post.id}`, (message) => {
          const event = JSON.parse(message.body);
          handleRealtimeEvent(event);
        });
      });
    });

    stompClient.activate();

    return () => {
      if (stompClient.active) stompClient.deactivate();
    };
  }, [loading, posts.length]); // Re-subscribe when posts list changes

  const handleRealtimeEvent = (event) => {
    const { postId, type, data } = event;

    if (type === 'LIKE') {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: data } : p));
    } else if (type === 'VIEW') {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, viewCount: data } : p));
    } else if (type === 'COMMENT') {
      setPostComments(prev => {
        const existing = prev[postId] || [];
        const isReply = !!data.parentId;

        if (isReply) {
          return {
            ...prev,
            [postId]: updateCommentInTree(existing, data.parentId, (parent) => {
              const existingReplies = parent.replies || [];
              if (existingReplies.some(r => String(r.id) === String(data.id))) return parent;
              return { ...parent, replies: [...existingReplies, data] };
            })
          };
        } else {
          if (existing.some(c => String(c.id) === String(data.id))) return prev;
          return {
            ...prev,
            [postId]: [data, ...existing]
          };
        }
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
    } else if (type === 'COMMENT_LIKE') {
      setPostComments(prev => {
        const existing = prev[postId] || [];
        return {
          ...prev,
          [postId]: updateCommentInTree(existing, data.id, (comment) => ({
            ...comment,
            reactions: data.reactions
          }))
        };
      });
    }
  };

  const filteredPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    if (activeEventId === "all") return posts;
    return posts.filter(p => p.eventId === activeEventId);
  }, [posts, activeEventId]);

  // --- Interaction Handlers ---
  const handleReactPost = async (postId, emoji) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }
    try {
      const res = await eventService.reactToPost(postId, { emoji });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...res.data, author: res.data.author || p.author } : p));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleReactComment = async (postId, commentId, emoji) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }
    try {
      const res = await eventService.reactToComment(commentId, { emoji });
      setPostComments(prev => ({
        ...prev,
        [postId]: updateCommentInTree(prev[postId] || [], commentId, (old) => ({
          ...old,
          ...res.data,
          author: res.data.author || old.author,
          commenter: res.data.commenter || old.commenter
        }))
      }));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleSubmitComment = async (postId, content) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để bình luận");
      return;
    }
    setSubmittingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const payload = content instanceof FormData ? content : (typeof content === 'object' ? content : { content });
      const res = await eventService.createComment(postId, payload);
      const newComment = res.data;
      setPostComments(prev => {
        const existing = prev[postId] || [];
        if (existing.some(c => String(c.id) === String(newComment.id))) return prev;
        return {
          ...prev,
          [postId]: [newComment, ...existing]
        };
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || "Không thể gửi bình luận";
      toast.error(errMsg);
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSubmitReply = async (postId, parentId, content) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để phản hồi");
      return;
    }
    setSubmittingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const payload = content instanceof FormData ? content : (typeof content === 'object' ? { ...content, parentId } : { content, parentId });
      const res = await eventService.createComment(postId, payload);
      const newReply = res.data;
      setPostComments(prev => ({
        ...prev,
        [postId]: updateCommentInTree(prev[postId] || [], parentId, (parent) => {
          const existingReplies = parent.replies || [];
          if (existingReplies.some(r => String(r.id) === String(newReply.id))) return parent;
          return {
            ...parent,
            replies: [...existingReplies, newReply]
          };
        })
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || "Không thể gửi phản hồi";
      toast.error(errMsg);
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    setPostComments(prev => ({
      ...prev,
      [postId]: removeCommentFromTree(prev[postId] || [], commentId)
    }));
    try {
      await eventService.deleteComment(commentId);
    } catch (err) {
      toast.error(language === 'VI' ? "Không thể xóa bình luận" : "Cannot delete comment");
    }
  };

  const handleHideComment = async (postId, commentId) => {
    try {
      setPostComments(prev => ({
        ...prev,
        [postId]: removeCommentFromTree(prev[postId] || [], commentId)
      }));
      toast.success(language === 'VI' ? "Đã ẩn bình luận" : "Comment hidden");
    } catch (err) {
      toast.error(language === 'VI' ? "Không thể ẩn bình luận" : "Cannot hide comment");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <NewsBanner t={t} />

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <NewsSidebar
              t={t}
              isFilterExpanded={isFilterExpanded}
              setIsFilterExpanded={setIsFilterExpanded}
              eventSearch={eventSearch}
              setEventSearch={setEventSearch}
              activeEventId={activeEventId}
              setActiveEventId={setActiveEventId}
              filteredEvents={filteredEvents}
              posts={posts}
              loading={loading}
              events={events}
            />

            {/* Feed Area */}
            <div className="lg:col-span-3 space-y-8">
              {loading ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                  <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">{"Đang tải bảng tin..."}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 mb-8">
                      <PostDetailManagement
                        post={post}
                        comments={postComments[post.id] || []}
                        currentUser={currentUser}
                        loading={false}
                        error={null}
                        handleReactPost={(emoji) => handleReactPost(post.id, emoji)}
                        handleReactComment={(commentId, emoji) => handleReactComment(post.id, commentId, emoji)}
                        handleSubmitComment={(content) => handleSubmitComment(post.id, content)}
                        handleSubmitReply={(parentId, content) => handleSubmitReply(post.id, parentId, content)}
                        handleDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
                        handleHideComment={(commentId) => handleHideComment(post.id, commentId)}
                        isSubmittingComment={submittingComments[post.id]}
                        onRefresh={() => loadComments(post.id)}
                        backPath="/news"
                        hideHeader={true}
                      />
                    </div>
                  ))}

                  {filteredPosts.length === 0 && (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                      <Newspaper size={48} className="text-slate-200 mx-auto mb-4" />
                      <h3 className="font-black text-slate-800 uppercase tracking-tight text-xl mb-2">{"Chưa có tin tức nào"}</h3>
                      <p className="text-slate-400 text-sm font-medium">{"Vui lòng chọn bộ lọc khác hoặc quay lại sau."}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
