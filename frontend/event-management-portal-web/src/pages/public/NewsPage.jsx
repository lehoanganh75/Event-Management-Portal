import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar, Eye, ArrowLeft, ThumbsUp, MessageCircle,
  Share2, Globe, MoreHorizontal, Pin, Loader2,
  Smile, Camera, Send, Filter, Newspaper, Info,
  X, Plus, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";
import { createStompClient } from "../../utils/socket";
import { useLanguage } from "../../context/LanguageContext";

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
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();

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
          // Nếu là phản hồi, tìm bình luận cha và thêm vào replies
          return {
            ...prev,
            [postId]: updateCommentInTree(existing, data.parentId, (parent) => {
              const existingReplies = parent.replies || [];
              if (existingReplies.some(r => String(r.id) === String(data.id))) return parent;
              return { ...parent, replies: [...existingReplies, data] };
            })
          };
        } else {
          // Nếu là bình luận cấp một
          if (existing.some(c => String(c.id) === String(data.id))) return prev;
          return {
            ...prev,
            [postId]: [data, ...existing]
          };
        }
      });
      // Cập nhật số lượng bình luận trên bài viết
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

  console.log(posts);


  const filteredPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    if (activeEventId === "all") return posts;
    return posts.filter(p => p.eventId === activeEventId);
  }, [posts, activeEventId]);

  // --- Interaction Handlers ---
  const handleReactPost = async (postId, emoji) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để thực hiện hành động này");
      navigate("/login");
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
      navigate("/login");
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
      navigate("/login");
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
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSubmitReply = async (postId, parentId, content) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để phản hồi");
      navigate("/login");
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
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    // Optimistic update
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
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Newspaper size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight uppercase">{t('news_banner_title')}</h1>
                <p className="text-blue-100 font-medium opacity-80">{t('news_banner_subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">


            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-24">
                <div
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-indigo-600" />
                    <h2 className="font-black text-slate-800 uppercase tracking-tighter">{t('filter_by_event')}</h2>
                  </div>
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    {isFilterExpanded ? <X size={16} /> : <Plus size={16} />}
                  </button>
                </div>

                {isFilterExpanded && (
                  <>
                    {/* Search inside filters */}
                    <div className="relative mb-4">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('search_event_placeholder')}
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <button
                        onClick={() => setActiveEventId("all")}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${activeEventId === "all"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "text-slate-500 hover:bg-slate-50"
                          }`}
                      >
                        <span>{t('all_news')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeEventId === "all" ? "bg-white/20" : "bg-slate-100"}`}>
                          {posts.length}
                        </span>
                      </button>

                      {filteredEvents.map(event => (
                        <button
                          key={event.id}
                          onClick={() => setActiveEventId(event.id)}
                          className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${activeEventId === event.id
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                          <div className="line-clamp-1">{event.title}</div>
                          <div className={`text-[9px] uppercase mt-0.5 opacity-60 ${activeEventId === event.id ? "text-white" : "text-indigo-500"}`}>
                            {event.type || "Sự kiện"}
                          </div>
                        </button>
                      ))}

                      {filteredEvents.length === 0 && eventSearch && (
                        <div className="py-8 text-center text-slate-400 text-[11px] font-medium italic">
                          {t('no_events_found_match')}
                        </div>
                      )}
                    </div>

                    {events.length === 0 && !loading && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <Info size={20} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{t('no_events_public_posts')}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Feed Area */}
            <div className="lg:col-span-3 space-y-8">
              {loading ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
                  <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">{t('loading_news')}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
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
                      <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-xl mb-2">{t('no_news_yet')}</h3>
                      <p className="text-slate-400 text-sm font-medium">{t('select_other_filter')}</p>
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