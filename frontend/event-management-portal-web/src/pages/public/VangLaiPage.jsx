// src/pages/VangLaiPage.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, MapPin, Loader2, Gift, ChevronLeft, ChevronRight,
  User, Clock, Sparkles, Calendar, LayoutGrid, BarChart3, QrCode
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import AIChatBot from "../../components/chat/AIChatBot";
import { useEvents } from "../../context/EventContext";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const EventCard = ({ event, onClick }) => {
  return (
    <div
      onClick={() => onClick(event.id)}
      className="min-w-[320px] md:min-w-[380px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-56">
        <img
          src={event.coverImage || "https://via.placeholder.com/400x250/1a479a/ffffff?text=IUH+Event"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Top Right Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
            Sắp diễn ra
          </span>
        </div>

        {/* Category Badge overlay */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md uppercase">
            {event.type || "Sự kiện"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {/* Time & Date */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(event.startTime)}</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-slate-800 text-lg leading-snug line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
        </div>

        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <MapPin size={16} className="text-amber-500 flex-shrink-0" />
            <span className="line-clamp-1">{event.location || "IUH Campus"}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Users size={16} className="text-amber-500 flex-shrink-0" />
            <span>{event.registeredCount || 0} / {event.maxParticipants || "∞"} tham gia</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="mt-auto w-full py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-300">
          Chi tiết
        </button>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, viewAllLink }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="space-y-1">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
      <p className="text-slate-500 text-sm">Đừng bỏ lỡ những hoạt động hấp dẫn tại IUH</p>
    </div>
    <Link
      to={viewAllLink}
      className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-700 transition-colors"
    >
      Xem tất cả
    </Link>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, colorClass }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-lg font-black text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

const VangLaiPage = () => {
  const navigate = useNavigate();
  const heroScrollRef = useRef(null);
  const upcomingScrollRef = useRef(null);
  const featuredScrollRef = useRef(null);

  const {
    featured,
    upcoming,
    fetchFeatured,
    fetchUpcoming,
    loading: eventLoading
  } = useEvents();

  useEffect(() => {
    fetchFeatured();
    fetchUpcoming();
  }, [fetchFeatured, fetchUpcoming]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <Layout onLogin={() => navigate("/login")}>
      <AIChatBot />

      <div className="bg-slate-50 min-h-screen pb-20">
        {/* HERO SECTION */}
        <section id="gioi-thieu" className="bg-white">
          <div className="relative bg-[#245bb5] text-white overflow-hidden py-16 md:py-24 px-6 md:px-20">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute right-[-5%] top-[-10%] w-150 h-150 rounded-full border-[60px] border-white"></div>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
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
                  <p className="text-base md:text-lg text-blue-100/90 max-w-xl leading-relaxed font-light">
                    Nền tảng tích hợp hỗ trợ tổ chức sự kiện, điểm danh QR Code và vòng quay may mắn.
                    Kết nối sinh viên và giảng viên trong một hệ sinh thái số hiện đại.
                  </p>

                  {/* BUTTON */}
                  <button
                    onClick={() => {
                      const el = document.getElementById("events-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group relative px-8 py-3.5 bg-[#ffcc00] text-[#1f4fa3]
                              rounded-xl font-semibold uppercase tracking-wide text-sm
                              shadow-lg hover:shadow-2xl
                              hover:scale-[1.04] active:scale-[0.97]
                              transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10">Khám phá sự kiện</span>
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition"></span>
                  </button>

                </div>

                {/* CỘT PHẢI - SLIDER SỰ KIỆN SẮP DIỄN RA */}
                <div className="lg:col-span-7 relative">
                  <div className="relative">
                    {/* Nút điều hướng */}
                    <button
                      onClick={() => scroll(heroScrollRef, "left")}
                      className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border border-white/30"
                    >
                      <ChevronLeft size={24} strokeWidth={3} />
                    </button>

                    <button
                      onClick={() => scroll(heroScrollRef, "right")}
                      className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border border-white/30"
                    >
                      <ChevronRight size={24} strokeWidth={3} />
                    </button>

                    <div className="flex items-center justify-between mb-6 px-2 text-white">
                      <h3 className="text-xl font-black tracking-tight uppercase">Sự kiện tiêu biểu</h3>
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs">
                        <Sparkles size={14} className="text-amber-300" />
                        <span>Nổi bật</span>
                      </div>
                    </div>

                    <div
                      ref={heroScrollRef}
                      className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                    >
                      {eventLoading ? (
                        <div className="w-full py-10 flex justify-center"><Loader2 className="animate-spin text-white" size={32} /></div>
                      ) : featured && featured.length > 0 ? (
                        featured.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event.id)}
                            className="min-w-[300px] bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer group flex flex-col snap-start"
                          >
                            <div className="relative h-40">
                              <img
                                src={event.coverImage || "https://via.placeholder.com/400x250"}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3">
                                <span className="bg-[#245bb5] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                                  {event.type || "EVENT"}
                                </span>
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h4 className="font-extrabold text-slate-800 line-clamp-2 text-sm mb-2 group-hover:text-blue-600 transition-colors">
                                {event.title}
                              </h4>
                              <div className="mt-auto space-y-1.5">
                                <div className="text-[#245bb5] font-bold text-[10px] flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatDate(event.startTime)}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                                  <MapPin size={12} className="flex-shrink-0" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-10 text-center text-white/70 text-sm italic">
                          Hiện chưa có sự kiện tiêu biểu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div id="events-section" className="pt-16 pb-16 px-6 md:px-20 max-w-7xl mx-auto">

          {/* SỰ KIỆN SẮP DIỄN RA */}
          <section className="mb-20">
            <SectionHeader title="Sự Kiện Sắp Diễn Ra" viewAllLink="/events" />

            <div className="relative group/scroll">
              <div
                ref={upcomingScrollRef}
                className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory"
              >
                {eventLoading ? (
                  <div className="w-full py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
                ) : upcoming && upcoming.length > 0 ? (
                  upcoming.map(event => (
                    <EventCard key={event.id} event={event} onClick={handleEventClick} />
                  ))
                ) : (
                  <div className="w-full py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">Chưa có sự kiện sắp tới</div>
                )}
              </div>

              {upcoming && upcoming.length > 3 && (
                <>
                  <button
                    onClick={() => scroll(upcomingScrollRef, "left")}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100 z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => scroll(upcomingScrollRef, "right")}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100 z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </section>

          {/* SỰ KIỆN SẮP DIỄN RA (Second Section) */}
          <section className="mb-20">
            <SectionHeader title="Sự kiện sắp diễn ra" viewAllLink="/events" />

            <div className="relative group/scroll">
              <div
                ref={featuredScrollRef}
                className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory"
              >
                {eventLoading ? (
                  <div className="w-full py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
                ) : upcoming && upcoming.length > 0 ? (
                  upcoming.map(event => (
                    <EventCard key={event.id} event={event} onClick={handleEventClick} />
                  ))
                ) : (
                  <div className="w-full py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">Chưa có sự kiện sắp tới</div>
                )}
              </div>

              {upcoming && upcoming.length > 3 && (
                <>
                  <button
                    onClick={() => scroll(featuredScrollRef, "left")}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100 z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => scroll(featuredScrollRef, "right")}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100 z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </section>

          {/* TÍNH NĂNG NỔI BẬT */}
          <section className="mt-32">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tính Năng Nổi Bật</h2>
              <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
                Hệ thống cung cấp bộ công cụ toàn diện giúp tối ưu hóa quy trình tổ chức và nâng cao trải nghiệm người tham gia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={Sparkles}
                title="AI Hỗ Trợ Toàn Diện"
                description="Tự động hóa quy trình từ lập kế hoạch, viết nội dung truyền thông đến phân tích phản hồi sau sự kiện."
                colorClass="bg-blue-50 text-blue-600"
              />
              <FeatureCard
                icon={QrCode}
                title="Check-in QR Code"
                description="Điểm danh nhanh chóng chỉ với 1 giây. Hệ thống tự động ghi nhận thời gian và xác thực người tham gia."
                colorClass="bg-purple-50 text-purple-600"
              />
              <FeatureCard
                icon={Gift}
                title="Vòng Quay May Mắn"
                description="Tăng tương tác với minigame vòng quay tích hợp. Tự động chọn người trúng thưởng minh bạch."
                colorClass="bg-amber-50 text-amber-600"
              />
              <FeatureCard
                icon={BarChart3}
                title="Thống Kê Real-time"
                description="Theo dõi số lượng đăng ký, tỉ lệ tham gia và hiệu quả sự kiện qua các biểu đồ trực quan thời gian thực."
                colorClass="bg-emerald-50 text-emerald-600"
              />
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default VangLaiPage;