import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EventHero = ({ event, language, t }) => {
  const navigate = useNavigate();

  console.log(event);


  return (
    <section className="relative h-[55vh] sm:h-[65vh] min-h-[400px] sm:min-h-[500px] w-full overflow-hidden">
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        src={event.imageUrl || event.coverImage || "https://images.unsplash.com/photo-1540575861501-7ce0e220abb4?q=80&w=2070&auto=format&fit=crop"}
        alt={event.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
        <button
          onClick={() => navigate(-1)}
          className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">{"Quay lại"}</span>
        </button>
      </div>

      <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-sm">
                {event.type || "Loại sự kiện"}
              </span>
              {event.hasLuckyDraw && (
                <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  <Zap size={12} fill="currentColor" />
                  LUCKY DRAW
                </span>
              )}
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-white/30">
                {event.eventMode || "OFFLINE"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-8 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">{"Ngày diễn ra"}</p>
                  <p className="font-semibold text-sm md:text-base">
                    {event.startTime ? new Date(event.startTime).toLocaleDateString(language === 'VI' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "12/05/2026"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">{"Địa điểm"}</p>
                  <p className="font-semibold text-sm md:text-base">{event.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventHero;
