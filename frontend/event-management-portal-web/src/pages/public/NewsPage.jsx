import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../components/layout/Layout";
import eventService from "../../services/eventService";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "latest", label: "Mới nhất" },
  { id: "popular", label: "Phổ biến" },
];

export default function NewsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      // Lấy tất cả bài viết đã xuất bản (PUBLISHED)
      const response = await eventService.getAllPosts({ status: 'PUBLISHED', size: 100 });
      // Dữ liệu trả về từ Spring Data Page nằm trong response.data.content
      setPosts(response.data?.content || []);
    } catch (error) {
      console.error("Error fetching news posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Lọc theo tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true;
    if (activeTab === "latest") return true;
    if (activeTab === "popular") return (post.viewCount || 0) > 50;
    return true;
  });

  // Sort theo tab
  const displayedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === "latest") {
      return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
    }
    if (activeTab === "popular") {
      return (b.viewCount || 0) - (a.viewCount || 0);
    }
    return 0;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-bold">Tin tức</h1>
            <p className="text-blue-100 mt-2 text-lg">
              Cập nhật tin tức, sự kiện và thành tích mới nhất của Đại học Công nghiệp TP.HCM
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Tabs */}
          <div className="flex gap-3 mb-10 border-b border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-3 rounded-2xl font-medium transition-all text-sm ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* News Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.slice(0, showAll ? undefined : 6).map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
                  onClick={() => navigate(`/news/${post.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={post.imageUrls?.[0] || "https://via.placeholder.com/800x500?text=IUH+News"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    {/* Badge */}
                    <div className="mb-4">
                      <span className="px-3 py-1.5 text-[10px] font-black bg-blue-50 text-blue-600 rounded-md uppercase tracking-widest">
                        {post.postType || "Tin tức"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-[19px] leading-tight line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>

                    <div className="text-gray-500 text-[14px] leading-relaxed line-clamp-2 mb-4" 
                         dangerouslySetInnerHTML={{ __html: post.content }} 
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4" />

                    <div className="flex items-center gap-6 text-[13px] text-gray-400 font-semibold mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={15} />
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye size={16} />
                        <span>{post.viewCount?.toLocaleString('vi-VN') || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && displayedPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Chưa có bài viết tin tức nào</p>
            </div>
          )}

          {/* Load more */}
          {!showAll && displayedPosts.length > 6 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setShowAll(true)}
                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
              >
                Xem thêm tin tức
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}