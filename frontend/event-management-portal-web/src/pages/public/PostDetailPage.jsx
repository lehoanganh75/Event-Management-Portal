import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, Eye, ArrowLeft, ThumbsUp, MessageCircle,
  Share2, Loader2, User, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import PostDetailManagement from "../../components/common/management/PostDetailManagement";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventService.getPostById(id);
      setPost(res.data);
      const commentRes = await eventService.getComments(id);
      setComments(commentRes.data || []);
    } catch (err) {
      setError("Không thể tải thông tin bài viết");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadPost();
  }, [id, loadPost]);

  const updateCommentInTree = (list, commentId, updateFn) => {
    return list.map(item => {
      if (item.id === commentId) return updateFn(item);
      if (item.replies?.length > 0) return { ...item, replies: updateCommentInTree(item.replies, commentId, updateFn) };
      return item;
    });
  };

  const handleReactPost = async (emoji) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để thực hiện hành động này");
      navigate("/login");
      return;
    }
    try {
      const res = await eventService.reactToPost(id, { emoji });
      setPost(prev => ({
        ...prev,
        ...res.data,
        author: res.data.author || prev.author
      }));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleReactComment = async (commentId, emoji) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để thực hiện hành động này");
      navigate("/login");
      return;
    }
    try {
      const res = await eventService.reactToComment(commentId, { emoji });
      setComments(prev => updateCommentInTree(prev, commentId, (old) => ({
        ...old,
        ...res.data,
        author: res.data.author || old.author,
        commenter: res.data.commenter || old.commenter
      })));
    } catch (err) {
      toast.error("Không thể thả icon");
    }
  };

  const handleSubmitComment = async (content) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để bình luận");
      navigate("/login");
      return;
    }
    setIsSubmittingComment(true);
    try {
      const res = await eventService.createComment(id, { content });
      setComments(prev => [res.data, ...prev]);
    } catch (err) {
      toast.error("Không thể gửi bình luận");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId, content) => {
    if (!currentUser) {
      toast.info("Vui lòng đăng nhập để phản hồi");
      navigate("/login");
      return;
    }
    setIsSubmittingComment(true);
    try {
      const res = await eventService.createComment(id, { content, parentId });
      setComments(prev => updateCommentInTree(prev, parentId, (parent) => ({
        ...parent,
        replies: [...(parent.replies || []), res.data]
      })));
    } catch (err) {
      toast.error("Không thể gửi phản hồi");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Đang tải bài viết...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header/Banner Area */}
        <div className="bg-[#1e3a8a] text-white pt-12 pb-24">
          <div className="max-w-5xl mx-auto px-6">
            <button
              onClick={() => navigate("/news")}
              className="flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại Tin tức</span>
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                {post?.postType || "Tin tức"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-8">
              {post?.title}
            </h1>

            <div className="flex flex-wrap gap-6 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{post?.author?.fullName || "Người dùng hệ thống"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{new Date(post?.publishedAt || post?.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span>{post?.viewCount?.toLocaleString() || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-6 -mt-16">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <PostDetailManagement
              post={post}
              comments={comments}
              currentUser={currentUser}
              loading={loading}
              error={error}
              handleReactPost={handleReactPost}
              handleReactComment={handleReactComment}
              handleSubmitComment={handleSubmitComment}
              handleSubmitReply={handleSubmitReply}
              isSubmittingComment={isSubmittingComment}
              onRefresh={loadPost}
              backPath="/news"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
