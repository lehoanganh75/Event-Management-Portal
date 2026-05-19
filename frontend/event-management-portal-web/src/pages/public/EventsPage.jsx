import React, {
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Newspaper,
  Loader2,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Layout from "../../components/layout/Layout";
import { useEvents } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from "react-toastify";

import eventService from "../../services/eventService";

import EventsSidebar from "../../components/events/hub/EventsSidebar";
import EventCard from "../../components/events/hub/EventCard";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";

const EventsPage = () => {
  const navigate = useNavigate();

  const { eventId } = useParams();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const { user } = useAuth();

  const { language, t } =
    useLanguage();

  const {
    userAll,
    ongoing,
    upcoming,
    fetchAllEvents,
    fetchOngoing,
    fetchUpcoming,
    loading: eventLoading,
  } = useEvents();

  const [activeView, setActiveView] =
    useState(
      searchParams.get("view") ||
      (eventId ? "news" : "list")
    );

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [activeTab, setActiveTab] =
    useState(
      searchParams.get("tab") || "all"
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [posts, setPosts] = useState([]);

  const [newsLoading, setNewsLoading] =
    useState(false);

  const itemsPerPage = 6;

  const [postComments, setPostComments] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});

  useEffect(() => {
    fetchAllEvents();
    fetchOngoing();
    fetchUpcoming();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["all", "upcoming", "ongoing"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("all");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeView === "news") {
      fetchNews();
    }
  }, [activeView, eventId]);

  const fetchNews = async () => {
    try {
      setNewsLoading(true);

      const res = eventId
        ? await eventService.getEventPosts(eventId)
        : await eventService.getAllPosts();

      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setNewsLoading(false);
    }
  };

  const loadComments = async (postId) => {
    try {
      const res = await eventService.getComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: res.data || [] }));
    } catch (err) {
      console.error(`Error loading comments for post ${postId}:`, err);
    }
  };

  const handleReactPost = async (postId, emoji) => {
    if (!user) return;
    try {
      await eventService.reactToPost(postId, { emoji });
      fetchNews();
    } catch (err) {
      console.error("Error reacting to post:", err);
    }
  };

  const handleSubmitComment = async (postId, content) => {
    if (!user) return;
    setSubmittingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const payload = content instanceof FormData ? content : { content };
      await eventService.createComment(postId, payload);
      loadComments(postId);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Không thể gửi bình luận";
      toast.error(errMsg);
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReactComment = async (postId, commentId, emoji) => {
    if (!user) return;
    try {
      await eventService.reactToComment(commentId, { emoji });
      loadComments(postId);
    } catch (err) {
      console.error("Error reacting to comment:", err);
    }
  };

  const handleSubmitReply = async (postId, parentId, content) => {
    if (!user) return;
    setSubmittingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const payload = content instanceof FormData ? content : { content, parentId };
      await eventService.createComment(postId, payload);
      loadComments(postId);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Không thể gửi phản hồi";
      toast.error(errMsg);
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const filteredEvents = useMemo(() => {
    let list =
      activeTab === "ongoing"
        ? ongoing || []
        : activeTab === "upcoming"
          ? upcoming || []
          : userAll || [];

    if (searchKeyword.trim()) {
      const kw =
        searchKeyword.toLowerCase();

      list = list.filter(
        (e) =>
          e.title
            ?.toLowerCase()
            .includes(kw) ||
          e.location
            ?.toLowerCase()
            .includes(kw)
      );
    }

    // Sort by status: ONGOING -> PUBLISHED/UPCOMING -> COMPLETED -> others
    const statusOrder = {
      ONGOING: 1,
      PUBLISHED: 2,
      UPCOMING: 2,
      COMPLETED: 3,
    };

    return [...list].sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.startTime) - new Date(a.startTime);
    });
  }, [
    activeTab,
    userAll,
    ongoing,
    upcoming,
    searchKeyword,
  ]);

  const totalPages = Math.ceil(
    filteredEvents.length /
    itemsPerPage
  );

  const paginatedEvents = useMemo(() => {
    const start =
      (currentPage - 1) *
      itemsPerPage;

    return filteredEvents.slice(
      start,
      start + itemsPerPage
    );
  }, [
    filteredEvents,
    currentPage,
  ]);

  const handleSearchChange = (
    value
  ) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  const handleViewChange = (
    view
  ) => {
    setActiveView(view);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("view", view);
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleTabChange = (
    tab
  ) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "all") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleEventClick = (id) =>
    navigate(`/events/${id}`);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Banner */}
        <div className="bg-[#1E40AF] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 relative z-10">
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-5"
            >
              <Sparkles
                size={15}
                className="text-yellow-300"
              />

              <span className="text-xs font-semibold tracking-wide">
                {"Khám phá hoạt động"}
              </span>
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              {"Hệ sinh thái sự kiện IUH"}
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="text-blue-100 max-w-2xl text-sm md:text-base"
            >
              {"Khám phá và tham gia hàng trăm sự kiện được tổ chức tại IUH. Từ các hội thảo học thuật đến các lễ hội văn hóa sôi động."}
            </motion.p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <EventsSidebar
              onSearchChange={
                handleSearchChange
              }
              searchKeyword={
                searchKeyword
              }
              t={t}
              user={user}
              navigate={navigate}
            />

            {/* Main */}
            <div className="flex-1 space-y-6">
              {/* Toolbar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex bg-slate-100 rounded-xl p-1 w-full md:w-auto">
                  <button
                    onClick={() =>
                      handleViewChange(
                        "list"
                      )
                    }
                    className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeView ===
                      "list"
                      ? "bg-white text-[#1E40AF] shadow-sm"
                      : "text-slate-500"
                      }`}
                  >
                    <Calendar size={16} />
                    {"Sự kiện"}
                  </button>

                  <button
                    onClick={() =>
                      handleViewChange(
                        "news"
                      )
                    }
                    className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeView ===
                      "news"
                      ? "bg-white text-[#1E40AF] shadow-sm"
                      : "text-slate-500"
                      }`}
                  >
                    <Newspaper size={16} />
                    {"Bản tin"}
                  </button>
                </div>

                {activeView ===
                  "list" && (
                    <div className="flex gap-2 w-full md:w-auto">
                      {[
                        "all",
                        "upcoming",
                        "ongoing",
                      ].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => handleTabChange(tab)}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab ===
                            tab
                            ? "bg-blue-50 text-[#1E40AF]"
                            : "text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                          {tab === "all"
                            ? "Tất cả"
                            : t(tab)}
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {activeView ===
                  "list" ? (
                  <motion.div
                    key="list"
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                  >
                    {eventLoading ? (
                      <div className="bg-white border border-slate-200 rounded-2xl py-24 flex flex-col items-center">
                        <Loader2 className="animate-spin text-[#1E40AF] mb-3" />

                        <p className="text-sm text-slate-500">
                          Loading...
                        </p>
                      </div>
                    ) : paginatedEvents.length >
                      0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {paginatedEvents.map(
                            (
                              item
                            ) => (
                              <EventCard
                                key={
                                  item.id
                                }
                                item={
                                  item
                                }
                                onClick={
                                  handleEventClick
                                }
                                t={t}
                                language={
                                  language
                                }
                              />
                            )
                          )}
                        </div>

                        {totalPages >
                          1 && (
                            <div className="flex justify-center items-center gap-3 mt-10">
                              <button
                                onClick={() =>
                                  setCurrentPage(
                                    (
                                      p
                                    ) =>
                                      Math.max(
                                        p -
                                        1,
                                        1
                                      )
                                  )
                                }
                                disabled={
                                  currentPage ===
                                  1
                                }
                                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 hover:border-[#1E40AF] hover:text-[#1E40AF] transition-all"
                              >
                                <ChevronLeft size={18} />
                              </button>

                              <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium">
                                {
                                  currentPage
                                }{" "}
                                /{" "}
                                {
                                  totalPages
                                }
                              </div>

                              <button
                                onClick={() =>
                                  setCurrentPage(
                                    (
                                      p
                                    ) =>
                                      Math.min(
                                        p +
                                        1,
                                        totalPages
                                      )
                                  )
                                }
                                disabled={
                                  currentPage ===
                                  totalPages
                                }
                                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 hover:border-[#1E40AF] hover:text-[#1E40AF] transition-all"
                              >
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-24 text-center">
                        <Calendar
                          size={42}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <h3 className="font-semibold text-slate-700 mb-1">
                          {"Không tìm thấy sự kiện phù hợp"}
                        </h3>

                        <p className="text-sm text-slate-400">
                          {"Vui lòng thử lại với từ khóa khác"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="news"
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                  >
                    {newsLoading ? (
                      <div className="bg-white border border-slate-200 rounded-2xl py-24 flex flex-col items-center">
                        <Loader2 className="animate-spin text-[#1E40AF] mb-3" />

                        <p className="text-sm text-slate-500">
                          Loading...
                        </p>
                      </div>
                    ) : posts.length >
                      0 ? (
                      <div className="max-w mx-auto space-y-6">
                        {posts.map((post) => (
                          <PostDetailManagement
                            key={post.id}
                            post={post}
                            comments={postComments[post.id] || []}
                            currentUser={user}
                            loading={false}
                            error={null}
                            handleReactPost={(emoji) => handleReactPost(post.id, emoji)}
                            handleReactComment={(commentId, emoji) => handleReactComment(post.id, commentId, emoji)}
                            handleSubmitComment={(content) => handleSubmitComment(post.id, content)}
                            handleSubmitReply={(parentId, content) => handleSubmitReply(post.id, parentId, content)}
                            isSubmittingComment={submittingComments[post.id]}
                            onRefresh={() => loadComments(post.id)}
                            hideHeader={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-24 text-center">
                        <Newspaper
                          size={42}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <h3 className="font-semibold text-slate-700 mb-1">
                          {"Không có bản tin nào"}
                        </h3>

                        <p className="text-sm text-slate-400">
                          {"Hãy quay lại sau để cập nhật tin tức mới nhất"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventsPage;
