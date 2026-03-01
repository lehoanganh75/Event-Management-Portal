import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Search, Mail, User, GraduationCap, Globe, LogOut } from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { useEffect, useState } from "react";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Quản trị",
  EVENT_MANAGER: "Giảng viên",
  LECTURER: "Giảng viên",
  ORGANIZER: "Ban Tổ Chức",
  STUDENT: "Sinh viên",
  GUEST: "Khách",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(null);
  
  // 1. Lấy thông tin user từ localStorage
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, [location]); // Cập nhật lại mỗi khi chuyển trang

  const isLecturerPage = location.pathname.startsWith("/lecturer");
  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  // Logic đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/");
  };

  // Logic Scroll Observer (giữ nguyên của bạn)
  useEffect(() => {
    if (location.pathname !== "/") return;
    const sections = ["gioi-thieu", "su-kien"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const best = visible.reduce((prev, current) => 
          Math.abs(current.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? current : prev
        );
        setActiveSection(best.target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0.1, 0.5] }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <header className="w-full font-sans sticky top-0 z-50 bg-white shadow-md">
      {/* TOP BAR */}
      <div className="bg-[#1a479a] text-white py-2 px-4 md:px-10 flex justify-between items-center text-xs md:text-sm">
        <div className="hidden md:block font-medium">
          Chào mừng đến với Hệ thống quản lý sự kiện - IUH
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="flex items-center gap-1 hover:text-orange-400 transition-colors">
            <Mail size={14} /> Hỗ trợ
          </button>
          <div className="h-3 w-px bg-white/30"></div>
          <div className="flex items-center gap-1 bg-white text-[#1a479a] px-2 py-0.5 rounded font-bold cursor-pointer">
            <Globe size={12} /> VN
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      {!isLoginPage && (
        <div className="bg-white px-4 md:px-10 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/")}>
            <img src={logo_iuh} alt="IUH Logo" className="h-12 md:h-14 object-contain" />
          </div>

          {/* Navigation Links */}
          {!isLecturerPage && (
            <nav className="hidden lg:flex items-center gap-8 font-bold uppercase text-[13px] tracking-wide">
              <a 
                onClick={() => {
                   if(location.pathname !== "/") navigate("/");
                   setTimeout(() => document.getElementById("gioi-thieu")?.scrollIntoView({behavior: "smooth"}), 100);
                }}
                className={`cursor-pointer transition-colors ${activeSection === "gioi-thieu" ? "text-orange-500" : "text-slate-700 hover:text-blue-700"}`}
              >
                Giới thiệu
              </a>
              <a 
                onClick={() => {
                  if(location.pathname !== "/") navigate("/");
                  setTimeout(() => {
                    const el = document.getElementById("su-kien");
                    if(el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
                  }, 100);
                }}
                className={`cursor-pointer transition-colors ${activeSection === "su-kien" ? "text-orange-500" : "text-slate-700 hover:text-blue-700"}`}
              >
                Sự kiện
              </a>
              <a href="/attendance" className="text-slate-700 hover:text-blue-700">Điểm danh</a>
              {currentUser?.roles?.some(r => ["ADMIN", "LECTURER"].includes(r)) && (
                 <a href="/lecturer/dashboard" className="text-slate-700 hover:text-blue-700">Quản lý</a>
              )}
            </nav>
          )}

          {/* AUTH SECTION */}
          <div className="flex items-center gap-4 border-l pl-6 border-slate-100">
            {currentUser ? (
              <div className="flex items-center gap-3 group relative">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">
                    {currentUser.username}
                  </p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                    {roleMap[currentUser.roles[0]] || "Thành viên"}
                  </p>
                </div>
                
                <div className="relative">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-blue-100 p-0.5 cursor-pointer hover:border-blue-500 transition-all"
                    />
                    {/* Dropdown đơn giản khi hover vào avatar */}
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <button 
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-linear-to-r from-[#1a479a] to-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 uppercase tracking-wider"
              >
                <LogIn size={16} /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;