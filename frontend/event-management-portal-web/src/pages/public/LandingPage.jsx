// src/pages/LandingPage.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, MapPin, Loader2, Gift, ChevronLeft, ChevronRight,
  User, Clock, Sparkles, Calendar, LayoutGrid, BarChart3, QrCode, MessageCircle
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import AIChatBot from "../../components/chat/AIChatBot";
import { useEvents } from "../../context/EventContext";
import { useLanguage } from "../../context/LanguageContext";

const formatDate = (dateString, lang = 'VI') => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat(lang === 'VI' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

const formatTime = (dateString, lang = 'VI') => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat(lang === 'VI' ? 'vi-VN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const EventCard = ({ event, onClick, t, language }) => {
  return (
    <div
      onClick={() => onClick(event.id)}
      className="min-w-[320px] md:min-w-[380px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-56">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Top Right Badge */}
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm ${event.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
            {event.status === 'ONGOING' ? t('ongoing') : t('upcoming')}
          </span>
        </div>

        {/* Category Badge overlay */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md uppercase">
            {event.type || t('event_type')}
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
              <span>{formatDate(event.startTime, language)}</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatTime(event.startTime, language)} - {formatTime(event.endTime, language)}</span>
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
            <span>{event.registeredCount || 0} / {event.maxParticipants || "∞"} {t('participants')}</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="mt-auto w-full py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-300">
          {t('details')}
        </button>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, viewAllLink, t }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="space-y-1">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
      <p className="text-slate-500 text-sm">{t('featured_events_subtitle')}</p>
    </div>
    <Link
      to={viewAllLink}
      className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-700 transition-colors"
    >
      {t('view_all')}
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

const LandingPage = () => {
  const navigate = useNavigate();
  const heroScrollRef = useRef(null);
  const upcomingScrollRef = useRef(null);
  const featuredScrollRef = useRef(null);

  const {
    featured,
    ongoing,
    upcoming,
    posts,
    fetchFeatured,
    fetchUpcoming,
    fetchOngoing,
    fetchAllPosts,
    loading: eventLoading
  } = useEvents();
  const { language, t } = useLanguage();

  useEffect(() => {
    fetchFeatured();
    fetchUpcoming();
    fetchOngoing();
    fetchAllPosts({ size: 3 }); // Lấy 3 bài viết mới nhất cho landing page
  }, [fetchFeatured, fetchUpcoming, fetchOngoing, fetchAllPosts]);

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
                      {t('hero_badge')}
                    </span>
                  </div>

                  {/* TITLE */}
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-medium text-white/80">
                      {t('welcome')}
                    </h2>

                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight tracking-[-0.02em] text-white">
                      {t('event_iuh')}{" "}
                      <span className="text-[#ffcc00] drop-shadow-md">
                        {new Date().getFullYear()}
                      </span>
                    </h1>
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-base md:text-lg text-blue-100/90 max-w-xl leading-relaxed font-light">
                    {t('hero_desc')}
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
                    <span className="relative z-10">{t('explore_events')}</span>
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
                      <h3 className="text-xl font-black tracking-tight uppercase">{t('featured_events')}</h3>
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs">
                        <Sparkles size={14} className="text-amber-300" />
                        <span>{t('highlight')}</span>
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
                                src={event.coverImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3">
                                <span className="bg-[#245bb5] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                                  {event.type || t('event_type')}
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
                                  {formatDate(event.startTime, language)}
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
                          {t('no_featured')}
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

          {/* SỰ KIỆN ĐANG DIỄN RA */}
          <section className="mb-20">
            <SectionHeader title={t('ongoing_events')} viewAllLink="/events" t={t} />

            <div className="relative group/scroll">
              <div
                ref={upcomingScrollRef}
                className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory"
              >
                {eventLoading ? (
                  <div className="w-full py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
                ) : ongoing && ongoing.length > 0 ? (
                  ongoing.map(event => (
                    <EventCard key={event.id} event={{ ...event, status: 'ONGOING' }} onClick={handleEventClick} t={t} language={language} />
                  ))
                ) : (
                  <div className="w-full py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">{t('no_ongoing')}</div>
                )}
              </div>

              {ongoing && ongoing.length > 3 && (
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
            <SectionHeader title={t('upcoming_events')} viewAllLink="/events" t={t} />

            <div className="relative group/scroll">
              <div
                ref={featuredScrollRef}
                className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory"
              >
                {eventLoading ? (
                  <div className="w-full py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
                ) : upcoming && upcoming.length > 0 ? (
                  upcoming.map(event => (
                    <EventCard key={event.id} event={{ ...event, status: 'UPCOMING' }} onClick={handleEventClick} t={t} language={language} />
                  ))
                ) : (
                  <div className="w-full py-20 text-center text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">{t('no_upcoming')}</div>
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

          {/* BẢN TIN / TIN TỨC MỚI NHẤT */}
          <section className="mb-32">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {language === 'VI' ? 'Bản tin mới nhất' : 'Latest Bulletin'}
                </h2>
                <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
              </div>
              <Link
                to="/news"
                className="group flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all"
              >
                {t('view_all')} <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {eventLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 h-64 animate-pulse border border-slate-100 shadow-sm" />
                ))
              ) : posts && posts.length > 0 ? (
                posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Media Preview */}
                    <div className="h-48 overflow-hidden relative bg-slate-100">
                      {post.mediaUrls && post.mediaUrls.length > 0 ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <LayoutGrid size={40} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm uppercase">
                          {post.postType === 'NEWS' ? t('news') : (post.postType || 'POST')}
                        </span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.fullName}`}
                          className="w-6 h-6 rounded-lg object-cover"
                          alt="author"
                        />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                          {post.author?.fullName || 'IUH Admin'}
                        </span>
                        <div className="w-1 h-1 bg-slate-300 rounded-full ml-auto" />
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString(language === 'VI' ? 'vi-VN' : 'en-US')}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h3>

                      <p className="text-slate-500 text-[13px] line-clamp-3 mb-6 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="mt-auto flex items-center gap-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                          <Sparkles size={14} className="text-amber-400" />
                          {post.reactions?.length || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                          <MessageCircle size={14} className="text-blue-400" />
                          {post.commentCount || 0}
                        </div>
                        <div className="ml-auto text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          {language === 'VI' ? 'Đọc thêm' : 'Read more'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <LayoutGrid size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">{language === 'VI' ? 'Chưa có bản tin nào' : 'No bulletins yet'}</p>
                </div>
              )}
            </div>
          </section>

          {/* TÍNH NĂNG NỔI BẬT */}
          <section className="mt-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t('features_title')}</h2>
              <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
                {t('features_desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={Sparkles}
                title={t('ai_feature')}
                description={t('ai_feature_desc')}
                colorClass="bg-blue-50 text-blue-600"
              />
              <FeatureCard
                icon={QrCode}
                title={t('qr_feature')}
                description={t('qr_feature_desc')}
                colorClass="bg-purple-50 text-purple-600"
              />
              <FeatureCard
                icon={Gift}
                title={t('lucky_feature')}
                description={t('lucky_feature_desc')}
                colorClass="bg-amber-50 text-amber-600"
              />
              <FeatureCard
                icon={BarChart3}
                title={t('stat_feature')}
                description={t('stat_feature_desc')}
                colorClass="bg-emerald-50 text-emerald-600"
              />
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;