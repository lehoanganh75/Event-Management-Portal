import { useLocation, useNavigate } from "react-router-dom";
import { EventFeed } from "../components/events/EventFeed";
import Layout from "../components/layout/Layout";
import { Award, TrendingUp, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getFeaturedEvents } from "../api/eventApi";

const VangLaiPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedEvents();
        setFeaturedEvents(response.data);
      } catch (error) {
        console.error("Lỗi khi load sự kiện đang diễn ra:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const res = await getFeaturedEvents();
      console.log("Dữ liệu từ API:", res.data);
      setFeaturedEvents(res.data);

      const sum = res.data.reduce((acc, ev) => acc + ev.registeredCount, 0);
      setTotalParticipants(sum);
    };
    loadData();
  }, []);

  const openModal = (type) => {
    if (type !== "login" && type !== "register") return;
    navigate(type === "login" ? "/login" : "/register");
  };

  const scrollToSuKien = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("su-kien");
        if (el) {
          const yOffset = -140;
          const y =
            el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 300);
    } else {
      const el = document.getElementById("su-kien");
      if (el) {
        const yOffset = -140;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <Layout onLogin={() => openModal("login")}>
      <section id="gioi-thieu" className="min-h-screen bg-white scroll-mt-35">
        <div className="relative bg-[#245bb5] text-white overflow-hidden py-12 md:py-20 px-4 md:px-20">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute right-[-5%] top-[-10%] w-150 h-150 rounded-full border-60 border-white"></div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Hệ thống quản lý sự kiện thông minh 4.0
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-light opacity-90">
                  Chào mừng đến với
                </h2>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                  Sự Kiện IUH{" "}
                  <span className="text-[#ffcc00] drop-shadow-md">
                    {new Date().getFullYear()}
                  </span>
                </h1>
              </div>

              <p className="text-base md:text-lg text-blue-50 max-w-xl leading-relaxed opacity-90">
                Nền tảng tích hợp AI hỗ trợ tổ chức sự kiện, điểm danh QR Code
                và Vòng quay may mắn. Kết nối sinh viên, giảng viên và doanh
                nghiệp trong một hệ sinh thái số toàn diện.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={scrollToSuKien}
                  className="px-8 py-3.5 bg-[#ffcc00] text-[#245bb5] rounded-xl font-black uppercase text-sm hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-xl"
                >
                  Khám phá sự kiện
                </button>
                <button
                  onClick={() => openModal("register")}
                  className="px-8 py-3.5 bg-white/10 border-2 border-white/30 text-white rounded-xl font-black uppercase text-sm hover:bg-white hover:text-[#245bb5] transition-all transform hover:-translate-y-1"
                >
                  Tạo sự kiện mới
                </button>
              </div>

              <div className="flex gap-10 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 group">
                  <div className="p-3 bg-white/10 rounded-2xl text-[#ffcc00] group-hover:scale-110 transition-transform">
                    <Award size={28} />
                  </div>
                  <div>
                    <div className="font-black text-xl leading-none">
                      QS Stars
                    </div>
                    <div className="text-[10px] uppercase tracking-tighter text-blue-200 mt-1">
                      4 Sao Quốc Tế
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="p-3 bg-white/10 rounded-2xl text-[#ffcc00] group-hover:scale-110 transition-transform">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <div className="font-black text-xl leading-none">#355</div>
                    <div className="text-[10px] uppercase tracking-tighter text-blue-200 mt-1">
                      BXH Châu Á
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block perspective-1000">
              <div className="bg-white/10 backdrop-blur-xl rounded-[40px] p-8 border border-white/20 shadow-2xl relative">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-wider">
                  Sự kiện đang diễn ra{" "}
                  <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full animate-bounce">
                    LIVE
                  </span>
                </h3>

                <div className="space-y-5">
                  {loading ? (
                    <div className="text-white/50 text-center py-4">
                      Đang tải...
                    </div>
                  ) : featuredEvents.length > 0 ? (
                    featuredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-3xl p-4 flex gap-4 text-gray-800 shadow-2xl transform hover:scale-105 transition-all cursor-pointer"
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-20 h-20 rounded-2xl object-cover shadow-md"
                        />
                        <div className="flex flex-col justify-center">
                          <div className="text-[10px] font-black text-blue-600 uppercase mb-1">
                            {event.eventDate} •{" "}
                            {event.eventTime.split(" - ")[0]}{" "}
                          </div>
                          <div className="font-bold text-base leading-tight">
                            {event.title}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1">
                            📍 {event.location}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/50 text-sm italic">
                      Hiện không có sự kiện nào.
                    </div>
                  )}
                </div>

                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-4xl shadow-2xl flex items-center gap-3 transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-gray-900 font-black text-xl leading-none">
                      {totalParticipants}+
                    </div>
                    <div className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">
                      Tham gia
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="w-full py-12 px-3 md:px-6">
          <div id="su-kien" className="p-3 md:p-6 min-h-screen">
            <EventFeed />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VangLaiPage;
