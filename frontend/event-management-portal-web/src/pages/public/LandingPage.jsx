// src/pages/LandingPage.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  Gift,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Sparkles,
  Calendar,
  BarChart3,
  QrCode,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import AIChatBot from "../../components/chat/AIChatBot";

import { useEvents } from "../../context/EventContext";
import { useLanguage } from "../../context/LanguageContext";

import { motion } from "framer-motion";

// Components
import LandingEventCard from "../../components/common/landing/LandingEventCard";
import LandingSectionHeader from "../../components/common/landing/LandingSectionHeader";
import LandingFeatureCard from "../../components/common/landing/LandingFeatureCard";

const LandingPage = () => {
  const navigate = useNavigate();

  const heroScrollRef = useRef(null);
  const ongoingScrollRef = useRef(null);
  const upcomingScrollRef = useRef(null);

  const {
    featured,
    ongoing,
    upcoming,
    fetchFeatured,
    fetchUpcoming,
    fetchOngoing,
    loading: eventLoading,
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
    if (!ref.current) return;

    const amount = direction === "left" ? -400 : 400;

    ref.current.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  return (
    <Layout onLogin={() => navigate("/login")}>
      <AIChatBot />

      <div className="min-h-screen bg-[#F8FAFC]">

        {/* HERO */}
        <section className="relative overflow-hidden bg-[#1E40AF]">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-300 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-indigo-300 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 pt-16 pb-24 md:pt-24 md:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

              {/* LEFT */}
              <div className="lg:col-span-5">

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    inline-flex items-center gap-2
                    bg-white/10
                    border border-white/10
                    px-4 py-1.5
                    rounded-full
                    text-[11px]
                    font-medium
                    tracking-wide
                    backdrop-blur-sm
                    text-white
                  "
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />

                  {t("hero_badge")}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-7"
                >
                  <h1
                    className="
                      text-5xl md:text-6xl lg:text-7xl
                      font-semibold
                      leading-[1]
                      tracking-tight
                      text-white
                    "
                  >
                    {t("event_iuh")}

                    <span className="block text-amber-300 mt-2">
                      {new Date().getFullYear()}
                    </span>
                  </h1>

                  <p
                    className="
                      mt-6
                      text-blue-100/80
                      text-base md:text-lg
                      leading-relaxed
                      max-w-xl
                    "
                  >
                    {t("hero_desc")}
                  </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-4 mt-10"
                >
                  <button
                    onClick={() => {
                      const el = document.getElementById("events-section");

                      if (el) {
                        el.scrollIntoView({
                          behavior: "smooth",
                        });
                      }
                    }}
                    className="
                      px-8 py-3.5
                      bg-white
                      text-[#1E40AF]
                      rounded-xl
                      font-medium
                      text-sm
                      hover:bg-blue-50
                      transition-all
                      shadow-sm
                    "
                  >
                    {t("explore_events")}
                  </button>

                  <Link
                    to="/news"
                    className="
                      px-8 py-3.5
                      border border-white/20
                      bg-white/5
                      rounded-xl
                      font-medium
                      text-sm
                      hover:bg-white/10
                      transition-all
                      backdrop-blur-sm
                      text-white
                    "
                  >
                    {t("news")}
                  </Link>
                </motion.div>

                {/* Stats */}
                <div className="flex items-center gap-8 mt-12">
                  <div>
                    <p className="text-2xl font-semibold text-white">
                      50+
                    </p>

                    <p className="text-xs text-blue-100/60 mt-1">
                      Sự kiện / năm
                    </p>
                  </div>

                  <div className="w-px h-10 bg-white/10" />

                  <div>
                    <p className="text-2xl font-semibold text-white">
                      10k+
                    </p>

                    <p className="text-xs text-blue-100/60 mt-1">
                      Sinh viên tham gia
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-7">

                <div className="flex items-center justify-between mb-5 px-1">
                  <h3 className="text-lg font-semibold text-white">
                    {t("featured_events")}
                  </h3>

                  <div
                    className="
                      inline-flex items-center gap-2
                      px-3 py-1.5
                      rounded-full
                      bg-white/10
                      border border-white/10
                      text-[11px]
                      text-white
                    "
                  >
                    <Sparkles size={12} />

                    {t("highlight")}
                  </div>
                </div>

                <div className="relative group/hero">

                  <div
                    ref={heroScrollRef}
                    className="
                      flex gap-6
                      overflow-x-auto
                      pb-8
                      no-scrollbar
                      snap-x snap-mandatory
                      scroll-smooth
                    "
                  >
                    {eventLoading ? (
                      <div className="w-full py-20 flex justify-center">
                        <Loader2
                          className="animate-spin text-white"
                          size={36}
                        />
                      </div>
                    ) : featured?.length > 0 ? (
                      featured.map((event) => (
                        <LandingEventCard
                          key={event.id}
                          event={event}
                          onClick={handleEventClick}
                          t={t}
                          language={language}
                        />
                      ))
                    ) : (
                      <div
                        className="
                          w-full py-16
                          text-center
                          rounded-2xl
                          border border-white/10
                          bg-white/5
                          text-white/60
                        "
                      >
                        {t("no_featured")}
                      </div>
                    )}
                  </div>

                  {/* Nav */}
                  <button
                    onClick={() => scroll(heroScrollRef, "left")}
                    className="
                      hidden md:flex
                      absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5
                      w-11 h-11
                      items-center justify-center
                      rounded-full
                      bg-white
                      text-slate-700
                      shadow-lg
                      border border-slate-200
                      opacity-0
                      group-hover/hero:opacity-100
                      transition-all
                    "
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={() => scroll(heroScrollRef, "right")}
                    className="
                      hidden md:flex
                      absolute right-0 top-1/2 -translate-y-1/2 translate-x-5
                      w-11 h-11
                      items-center justify-center
                      rounded-full
                      bg-white
                      text-slate-700
                      shadow-lg
                      border border-slate-200
                      opacity-0
                      group-hover/hero:opacity-100
                      transition-all
                    "
                  >
                    <ChevronRightIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <div
          id="events-section"
          className="
            max-w-7xl
            mx-auto
            px-6 lg:px-20
            pt-20
            pb-24
          "
        >

          {/* ONGOING */}
          <section className="mb-20">

            <LandingSectionHeader
              title={t("ongoing_events")}
              subtitle="Những sự kiện đang diễn ra ngay lúc này"
              viewAllLink="/events"
              t={t}
            />

            <div className="relative group/scroll">

              <div
                ref={ongoingScrollRef}
                className="
                  flex gap-6
                  overflow-x-auto
                  pb-6
                  no-scrollbar
                  snap-x snap-mandatory
                  scroll-smooth
                "
              >
                {eventLoading ? (
                  <div className="w-full py-20 flex justify-center">
                    <Loader2
                      className="animate-spin text-blue-600"
                      size={36}
                    />
                  </div>
                ) : ongoing?.length > 0 ? (
                  ongoing.map((event) => (
                    <LandingEventCard
                      key={event.id}
                      event={{
                        ...event,
                        status: "ONGOING",
                      }}
                      onClick={handleEventClick}
                      t={t}
                      language={language}
                    />
                  ))
                ) : (
                  <div
                    className="
                      w-full py-16
                      bg-white
                      border border-dashed border-slate-200
                      rounded-2xl
                      text-center
                      text-slate-400
                    "
                  >
                    {t("no_ongoing")}
                  </div>
                )}
              </div>

              {ongoing?.length > 3 && (
                <>
                  <button
                    onClick={() => scroll(ongoingScrollRef, "left")}
                    className="
                      hidden md:flex
                      absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5
                      w-11 h-11
                      items-center justify-center
                      rounded-full
                      bg-white
                      border border-slate-200
                      shadow-lg
                      text-slate-600
                      opacity-0
                      group-hover/scroll:opacity-100
                      transition-all
                    "
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={() => scroll(ongoingScrollRef, "right")}
                    className="
                      hidden md:flex
                      absolute right-0 top-1/2 -translate-y-1/2 translate-x-5
                      w-11 h-11
                      items-center justify-center
                      rounded-full
                      bg-white
                      border border-slate-200
                      shadow-lg
                      text-slate-600
                      opacity-0
                      group-hover/scroll:opacity-100
                      transition-all
                    "
                  >
                    <ChevronRightIcon size={20} />
                  </button>
                </>
              )}
            </div>
          </section>

          {/* UPCOMING */}
          <section className="mb-20">

            <LandingSectionHeader
              title={t("upcoming_events")}
              subtitle="Sắp diễn ra, đừng bỏ lỡ cơ hội tham gia"
              viewAllLink="/events"
              t={t}
            />

            <div className="relative group/scroll">

              <div
                ref={upcomingScrollRef}
                className="
                  flex gap-6
                  overflow-x-auto
                  pb-6
                  no-scrollbar
                  snap-x snap-mandatory
                  scroll-smooth
                "
              >
                {eventLoading ? (
                  <div className="w-full py-20 flex justify-center">
                    <Loader2
                      className="animate-spin text-blue-600"
                      size={36}
                    />
                  </div>
                ) : upcoming?.length > 0 ? (
                  upcoming.map((event) => (
                    <LandingEventCard
                      key={event.id}
                      event={{
                        ...event,
                        status: "UPCOMING",
                      }}
                      onClick={handleEventClick}
                      t={t}
                      language={language}
                    />
                  ))
                ) : (
                  <div
                    className="
                      w-full py-16
                      bg-white
                      border border-dashed border-slate-200
                      rounded-2xl
                      text-center
                      text-slate-400
                    "
                  >
                    {t("no_upcoming")}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="mt-24">

            <div className="text-center mb-16">



              <h2
                className="
                  text-4xl md:text-5xl
                  font-semibold
                  text-slate-900
                  tracking-tight
                "
              >
                {t("features_title")}
              </h2>

              <p
                className="
                  mt-5
                  max-w-3xl
                  mx-auto
                  text-slate-500
                  text-base
                  leading-relaxed
                "
              >
                {t("features_desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <LandingFeatureCard
                icon={Sparkles}
                title={t("ai_feature")}
                description={t("ai_feature_desc")}
                colorClass="bg-blue-600 text-white"
              />

              <LandingFeatureCard
                icon={QrCode}
                title={t("qr_feature")}
                description={t("qr_feature_desc")}
                colorClass="bg-indigo-600 text-white"
              />

              <LandingFeatureCard
                icon={Gift}
                title={t("lucky_feature")}
                description={t("lucky_feature_desc")}
                colorClass="bg-amber-500 text-white"
              />

              <LandingFeatureCard
                icon={BarChart3}
                title={t("stat_feature")}
                description={t("stat_feature_desc")}
                colorClass="bg-emerald-500 text-white"
              />
            </div>
          </section>


        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;