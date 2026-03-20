import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Mail, User, Globe, LogOut, Settings, ShieldCheck, ChevronDown } from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { useEffect, useState, useRef } from "react";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Quản trị hệ thống",
  EVENT_MANAGER: "Giảng viên quản lý",
  LECTURER: "Giảng viên",
  ORGANIZER: "Ban Tổ Chức",
  STUDENT: "Sinh viên",
  GUEST: "Khách mời",
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Lấy dữ liệu user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Lỗi parse user data:", error);
        localStorage.removeItem("user");
      }
    } else {
      setCurrentUser(null); // Đảm bảo UI cập nhật khi logout
    }
  }, [location]); // Cập nhật lại khi chuyển trang

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLecturerPage = location.pathname.startsWith("/lecturer");
  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = async () => {
    try {
      const API_LOGOUT = "http://localhost:8082/api/auth/logout";
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        // Gọi API Logout (truyền @RequestParam qua params)
        await axios.post(API_LOGOUT, null, {
          params: { refreshToken: refreshToken }
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      // Dọn dẹp cục bộ luôn nằm trong finally
      localStorage.clear(); // Xóa sạch để đảm bảo an toàn
      setCurrentUser(null);
      setIsMenuOpen(false);
      navigate("/login");
    }
  };

  return (
    <header className="w-full font-sans sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* TOP BAR */}
      <div className="bg-linear-to-r from-[#1a479a] to-[#2563eb] text-white py-1.5 px-4 md:px-10 flex justify-between items-center text-[11px] font-medium tracking-wide">
        <div className="hidden md:flex items-center gap-2 opacity-90">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Hệ thống Quản lý Sự kiện IUH
        </div>

        <div className="flex items-center gap-5 ml-auto">
          <button className="hover:text-orange-300 transition-colors flex items-center gap-1">
            <Mail size={12} /> Hỗ trợ kỹ thuật
          </button>
          <div className="h-3 w-px bg-white/20"></div>
          <div className="flex items-center gap-1.5 cursor-pointer group">
            <Globe size={12} className="group-hover:rotate-12 transition-transform" />
            <span>Tiếng Việt (VN)</span>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      {!isLoginPage && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <div 
            className="cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-95" 
            onClick={() => navigate("/")}
          >
            <img src={logo_iuh} alt="IUH Logo" className="h-10 md:h-12 object-contain" />
          </div>

          {!isLecturerPage && (
            <nav className="hidden lg:flex items-center gap-1">
              <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all">
                Trang chủ
              </button>
              <a href="/attendance" className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all">
                Điểm danh
              </a>
              {/* Kiểm tra quyền Admin/Lecturer an toàn */}
              {currentUser?.roles?.some(r => ["ADMIN", "LECTURER", "SUPER_ADMIN"].includes(r)) && (
                 <button onClick={() => navigate("/lecturer/dashboard")} className="ml-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-100 transition-all border border-orange-100">
                    Bảng điều khiển
                 </button>
              )}
            </nav>
          )}

          {/* AUTH SECTION */}
          <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <div 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="relative">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      alt="Avatar"
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.username}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-tighter">
                       {/* Dùng Optional Chaining để tránh lỗi undefined */}
                       {roleMap[currentUser?.roles?.[0]] || "Thành viên"}
                    </p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </div>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                          {currentUser.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{currentUser.username}</p>
                          <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> {roleMap[currentUser?.roles?.[0]] || "Người dùng"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button onClick={() => { navigate("/userprofile"); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                        <User size={16} className="text-slate-400" /> Hồ sơ cá nhân
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                        <Settings size={16} className="text-slate-400" /> Cài đặt tài khoản
                      </button>
                    </div>

                    <div className="p-2 bg-slate-50 border-t border-slate-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-100 rounded-xl transition-colors">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="group flex items-center gap-2 bg-linear-to-r from-[#1a479a] to-blue-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 uppercase tracking-wide"
              >
                <LogIn size={16} className="group-hover:translate-x-1 transition-transform" /> 
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;