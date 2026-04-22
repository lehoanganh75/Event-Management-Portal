// src/pages/VangLaiPage.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MapPin, Loader2, Gift, ChevronLeft, ChevronRight, User, Clock, Sparkles } from "lucide-react";

import Layout from "../components/layout/Layout";
import EventFeed from "../components/events/EventFeed";
import AIChatBot from "../components/chat/AIChatBot";
import { useEvents } from "../context/EventContext";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

const VangLaiPage = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const { 
    featured, 
    fetchFeatured,
    loading: eventLoading 
  } = useEvents();

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    if (window.location.hash === "#su-kien") {
      setTimeout(() => {
        const el = document.getElementById("su-kien");
        if (el) {
          const yOffset = -140;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 300);
    }
  }, []);
  const totalParticipants = useMemo(() => {
    if (!Array.isArray(featured)) return 0;
    return featured.reduce((acc, ev) => acc + (ev.registeredCount || 0), 0);
  }, [featured]);

  const scrollToSuKien = () => {
    const el = document.getElementById("su-kien");
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: "smooth" });
    }
  };

  return (
    <Layout onLogin={() => navigate("/login")}>
      {/* AI Chat Bot */}
      <AIChatBot />
      
      <section id="gioi-thieu" className="min-h-screen bg-white scroll-mt-35 font-roboto">
        <div className="relative bg-[#245bb5] text-white overflow-hidden py-16 md:py-24 px-6 md:px-20">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute right-[-5%] top-[-10%] w-150 h-150 rounded-full border-60 border-white"></div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

              {/* CỘT TRÁI */}
              <div className="lg:col-span-5 space-y-6">

                {/* BADGE */}
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                    Hệ thống quản lý sự kiện 4.0
                  </span>
                </div>

                {/* TITLE */}
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-medium text-white/80">
                    Chào mừng đến với
                  </h2>

                  <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight tracking-[-0.02em] text-white">
                    Sự Kiện IUH{" "}
                    <span className="text-[#ffcc00] drop-shadow-md">
                      {new Date().getFullYear()}
                    </span>
                  </h1>
                </div>

                {/* DESCRIPTION */}
                <p className="text-base md:text-lg text-blue-100/90 max-w-lg leading-relaxed font-light">
                  Nền tảng tích hợp hỗ trợ tổ chức sự kiện, điểm danh QR Code và vòng quay may mắn. 
                  Kết nối sinh viên và giảng viên trong một hệ sinh thái số hiện đại.
                </p>

                {/* BUTTON */}
                <button
                  onClick={scrollToSuKien}
                  className="group relative px-8 py-3.5 bg-[#ffcc00] text-[#1f4fa3]
                            rounded-xl font-semibold uppercase tracking-wide text-sm
                            shadow-lg hover:shadow-2xl
                            hover:scale-[1.04] active:scale-[0.97]
                            transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Khám phá sự kiện</span>

                  {/* Glow effect */}
                  <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition"></span>
                </button>

              </div>

              {/* CỘT PHẢI - SLIDER */}
              <div className="lg:col-span-7 relative">
                <div className="relative">

                  {/* Nút điều hướng */}
                  <button
                    onClick={scrollLeft}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border border-white/30"
                  >
                    <ChevronLeft size={28} strokeWidth={3} />
                  </button>

                  <button
                    onClick={scrollRight}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border border-white/30"
                  >
                    <ChevronRight size={28} strokeWidth={3} />
                  </button>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="text-3xl font-black tracking-tight">SỰ KIỆN TIÊU BIỂU</h3>
                    <div className="bg-white/90 text-[#245bb5] px-6 py-3 rounded-3xl flex items-center gap-2 font-semibold shadow">
                      <Users size={20} />
                      <span>{totalParticipants}+</span>
                      <span className="text-xs opacity-70">đã tham gia</span>
                    </div>
                  </div>

                  {/* Scroll Container */}
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth"
                  >
                    {eventLoading ? (
                      <div className="w-full py-20 flex justify-center">
                        <Loader2 className="animate-spin text-white" size={48} />
                      </div>
                    ) : featured && featured.length > 0 ? (
                      featured.map((event) => {
                        const percent = event.maxParticipants 
                          ? Math.min((event.registeredCount / event.maxParticipants) * 100, 100) 
                          : 0;

                        const presenter = event.presenters?.[0]?.fullName;

                        return (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event.id)}
                            className="min-w-95 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col"
                          >
                            {/* Cover Image */}
                            <div className="relative h-48">
                              <img
                                src={event.coverImage || "https://via.placeholder.com/400x250"}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {/* Type Badge */}
                              <div className="absolute top-4 left-4">
                                <span className="bg-[#245bb5] text-white text-xs font-bold px-4 py-1.5 rounded-2xl shadow">
                                  {event.type || "EVENT"}
                                </span>
                              </div>

                              {/* Status (nếu có) */}
                              {event.status && (
                                <div className="absolute top-4 right-4">
                                  <span className={`px-3 py-1 text-xs font-bold rounded-xl ${
                                    event.status === 'UPCOMING' ? 'bg-green-500' : 
                                    event.status === 'ONGOING' ? 'bg-orange-500' : 'bg-gray-500'
                                  } text-white`}>
                                    {event.status}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col">
                              {/* Title - Quan trọng nhất */}
                              <div className="flex flex-col space-y-2">
                                {/* Tiêu đề: Luôn hiện, màu sắc đậm rõ nét */}
                                <h4 className="font-extrabold text-xl leading-tight text-slate-800 line-clamp-2">
                                  {event.title}
                                </h4>

                                {/* Start Time */}
                                <div className="text-[#245bb5] font-bold mt-1 text-sm flex items-center gap-1">
                                  <Clock size={14} />
                                  Thời gian: {formatDate(event.startTime)}
                                </div>
                              </div>

                              {/* Location */}
                              <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <MapPin size={18} className="flex-shrink-0" />
                                <span className="text-sm line-clamp-1">{event.location}</span>
                              </div>

                              {/* Presenter (nâng cao) */}
                              {presenter && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                                  <User size={16} />
                                  <span className="line-clamp-1">Diễn giả: {presenter}</span>
                                </div>
                              )}

                              {/* Topic (nâng cao) */}
                              {event.eventTopic && (
                                <div className="mt-2 text-xs text-gray-500 line-clamp-1">
                                  Chủ đề: {event.eventTopic}
                                </div>
                              )}

                              {/* Registered Count & Progress */}
                              <div className="mt-auto pt-6">
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                  <span>Đăng ký</span>
                                  <span className="font-medium text-gray-700">
                                    {event.registeredCount || 0} / {event.maxParticipants || "—"}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#245bb5] rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>

                              {/* Lucky Draw */}
                              {event.hasLuckyDraw && (
                                <div className="flex items-center gap-2 mt-4 text-orange-600 text-sm font-medium">
                                  <Gift size={18} />
                                  <span>Có vòng quay may mắn</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full text-center py-20 text-white/70 text-lg">
                        Hiện chưa có sự kiện tiêu biểu
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full py-20 px-4 md:px-10 bg-[#f8fafc]">
          <div id="su-kien" className="max-w-7xl mx-auto">
            <EventFeed />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VangLaiPage;