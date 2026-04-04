// src/pages/VangLaiPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, TrendingUp, Users, MapPin } from "lucide-react";

import Layout from "../components/layout/Layout";
import { EventFeed } from "../components/events/EventFeed";
import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";

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
  const location = useLocation();

  const { events } = useEvent();
  const { user, loading: authLoading } = useAuth();

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeatured = async () => {
        try {
            setLoading(true);
            const res = await events.getFeaturedEvents();
            
            if (res.data && Array.isArray(res.data)) {
                setFeaturedEvents(res.data);

                // TẬN DỤNG TRỰC TIẾP registeredCount TỪ BACKEND
                const total = res.data.reduce((acc, ev) => acc + (ev.registeredCount || 0), 0);
                
                setTotalParticipants(total);
            }
        } catch (err) {
            console.error("Lỗi tải sự kiện tiêu biểu:", err);
        } finally {
            setLoading(false);
        }
    };
    loadFeatured();
  }, [events]);

  const scrollToSuKien = () => {
    const el = document.getElementById("su-kien");
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const isAllowedToCreate = useMemo(() => {
    // Nếu đang load auth thì tạm thời chưa cho hiện nút quản lý
    if (authLoading || !user || !user.role) return false;
    
    const userRole = user.role.toUpperCase();
    const authorizedRoles = ["ADMIN", "ORGANIZER", "SUPER_ADMIN", "LECTURER"];
    
    return authorizedRoles.includes(userRole);
  }, [user, authLoading]);

  const handleEventClick = (event) => {
    navigate(`/events/${event.id}`);
  };
  
  return (
    <Layout onLogin={() => navigate("/login")}>
      <section id="gioi-thieu" className="min-h-screen bg-white scroll-mt-35">
        {/* Banner Section */}
        <div className="relative bg-[#245bb5] text-white overflow-hidden py-12 md:py-20 px-4 md:px-20">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute right-[-5%] top-[-10%] w-150 h-150 rounded-full border-60 border-white"></div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                  Hệ thống quản lý sự kiện thông minh 4.0
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-light opacity-90">Chào mừng đến với</h2>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                  Sự Kiện IUH <span className="text-[#ffcc00]">{new Date().getFullYear()}</span>
                </h1>
              </div>

              <p className="text-base md:text-lg text-blue-50 max-w-xl leading-relaxed opacity-90">
                Nền tảng tích hợp hỗ trợ tổ chức sự kiện, điểm danh QR Code và Vòng quay may mắn. 
                Kết nối sinh viên, giảng viên trong một hệ sinh thái số toàn diện.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={scrollToSuKien}
                  className="px-8 py-3.5 bg-[#ffcc00] text-[#245bb5] rounded-xl font-black uppercase text-sm hover:bg-yellow-400 transition-all shadow-xl cursor-pointer"
                >
                  Khám phá sự kiện
                </button>
                {isAllowedToCreate && (
                  <button
                    onClick={() => navigate("/lecturer")}
                    className="px-8 py-3.5 bg-white/10 border-2 border-white/30 text-white rounded-xl font-black uppercase text-sm hover:bg-white hover:text-[#245bb5] transition-all cursor-pointer"
                  >
                    Quản lý của tôi
                  </button>
                )}
              </div>

              <div className="flex gap-10 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl text-[#ffcc00]">
                    <Award size={28} />
                  </div>
                  <div>
                    <div className="font-black text-xl text-white">QS Stars</div>
                    <div className="text-[10px] uppercase text-blue-200">4 Sao Quốc Tế</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl text-[#ffcc00]">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <div className="font-black text-xl text-white">Top 355</div>
                    <div className="text-[10px] uppercase text-blue-200">BXH Châu Á</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Events Preview Card */}
            <div className="relative hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-8 border border-white/20 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase text-white">
                  Sự kiện tiêu biểu 
                  <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                </h3>

                <div className="space-y-5">
                  {loading ? (
                    <div className="py-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
                  ) : featuredEvents.length > 0 ? (
                    featuredEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="bg-white rounded-3xl p-4 flex gap-4 text-gray-800 transition-all cursor-pointer hover:bg-blue-50 group"
                      >
                        <img
                          src={event.coverImage || "https://via.placeholder.com/150"}
                          alt=""
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <div className="flex flex-col justify-center flex-1">
                          <div className="text-[10px] font-black text-blue-600 uppercase">
                            {formatDate(event.startTime)}
                          </div>
                          <div className="font-bold text-base line-clamp-1">{event.title}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> {event.location}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/60 text-center py-10">Hiện chưa có sự kiện nổi bật</div>
                  )}
                </div>

                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-2xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-gray-900 font-black text-xl">{totalParticipants}+</div>
                    <div className="text-gray-400 text-[10px] uppercase font-bold">Tham gia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Feed Section */}
        <div className="w-full py-12 px-4 md:px-10">
          <div id="su-kien" className="min-h-screen">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-slate-800 uppercase">Danh sách sự kiện</h2>
              <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
            </div>
            <EventFeed />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VangLaiPage;