import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "./layout/Layout";
import eventService from "../services/eventService";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "latest", label: "Mới nhất" },
  { id: "popular", label: "Phổ biến" },
];

export default function NewsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchCompletedEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventService.getCompletedEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching completed events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedEvents();
  }, [fetchCompletedEvents]);

  // Lọc theo tab
  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") return true;
    if (activeTab === "latest") return true; // Có thể sort sau
    if (activeTab === "popular") return (event.viewCount || 0) > 100; // Ví dụ: popular nếu có nhiều lượt xem
    return true;
  });

  // Sort theo tab
  const displayedEvents = [...filteredEvents].sort((a, b) => {
    if (activeTab === "latest") {
      return new Date(b.endTime) - new Date(a.endTime); // Mới nhất
    }
    if (activeTab === "popular") {
      return (b.viewCount || 0) - (a.viewCount || 0); // Phổ biến
    }
    return 0;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white py-8">
          <div className="max-w-7xl mx-auto px-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={18} />
              <span>Trang chủ</span>
            </button>

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
                className={`px-8 py-3 rounded-2xl font-medium transition-all text-sm ${
                  activeTab === tab.id
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
              {displayedEvents.slice(0, showAll ? undefined : 6).map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/news/${event.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.coverImage || "https://via.placeholder.com/800x500?text=IUH+Event"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                        {event.type || "Sự kiện"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-semibold text-xl leading-tight line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(event.endTime).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{event.viewCount || 0} lượt xem</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && displayedEvents.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Chưa có sự kiện nào đã kết thúc</p>
            </div>
          )}

          {/* Load more */}
          {!showAll && displayedEvents.length > 6 && (
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