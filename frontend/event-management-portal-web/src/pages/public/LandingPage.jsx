// src/pages/LandingPage.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, MapPin, Loader2, Gift, ChevronLeft, ChevronRight as ChevronRightIcon,
  User, Clock, Sparkles, Calendar, BarChart3, QrCode
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
  const isOngoing = event.status === 'ONGOING';
  
  return (
    <div
      onClick={() => onClick(event.id)}
      className="min-w-[300px] md:min-w-[340px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col snap-start"
    >
      {/* Image Container */}
      <div className="relative h-48">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 ${
            isOngoing ? 'bg-emerald-500/90 text-white' : 'bg-blue-500/90 text-white'
          }`}>
            {isOngoing ? t('ongoing') : t('upcoming')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>{event.type || t('event_type')}</span>
          <span>•</span>
          <span>{formatDate(event.startTime, language)}</span>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-4">
          {event.title}
        </h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin size={14} className="text-slate-400" />
            <span className="line-clamp-1">{event.location || "IUH Campus"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Users size={14} className="text-slate-400" />
            <span>{event.registeredCount || 0} / {event.maxParticipants || "∞"}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-blue-600">
          <span>{t('details')}</span>
          <ChevronRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
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
  }, [fetchFeatured, fetchUpcoming, fetchOngoing]);

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
              <div className="absolute right-[-5%] top-[-10%] w-[600px] h-[600px] rounded-full border-[40px] border-white"></div>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
                {/* CỘT TRÁI */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                      {t('hero_badge')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
                      {t('event_iuh')}{" "}
                      <span className="text-[#ffcc00] drop-shadow-md">
                        {new Date().getFullYear()}
                      </span>
                    </h1>
                    <p className="text-blue-100/90 text-base md:text-lg max-w-md font-medium leading-relaxed">
                      {t('hero_desc')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById("events-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="group relative px-8 py-3.5 bg-[#ffcc00] text-[#1f4fa3] rounded-xl font-bold uppercase tracking-wide text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      {t('explore_events')}
                    </button>
                    <Link
                      to="/news"
                      className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-white/20 transition-all duration-300"
                    >
                      {t('news')}
                    </Link>
                  </div>
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
                      <ChevronRightIcon size={24} strokeWidth={3} />
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
                    <EventCard key={event.id} event={{...event, status: 'ONGOING'}} onClick={handleEventClick} t={t} language={language} />
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
                    <ChevronRightIcon size={24} />
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
                    <EventCard key={event.id} event={{...event, status: 'UPCOMING'}} onClick={handleEventClick} t={t} language={language} />
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
                    <ChevronRightIcon size={24} />
                  </button>
                </>
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