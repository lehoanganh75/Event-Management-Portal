import { useNavigate, useLocation } from "react-router-dom";
import {
  LogIn,
  Mail,
  User,
  Globe,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên Cao Cấp",
  ADMIN: "Quản Trị Viên",
  ORGANIZER: "Ban Tổ Chức",
  MEMBER: "Thành Viên",
  EVENT_PARTICIPANT: "Người Tham Gia Sự Kiện",
  GUEST: "Khách",
};

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "http://localhost:8082/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef(null);
  const lastClickedRef = useRef(null);
  const lockActiveRef = useRef(false);
  const lockTimerRef = useRef(null);

  const checkActiveSection = useCallback(() => {
    if (lockActiveRef.current) return;

    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }

    if (isScrollingRef.current) return;

    const sections = ["gioi-thieu", "su-kien"];
    let foundSection = null;
    let maxVisiblePercent = 0;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visiblePercent = (visibleHeight / rect.height) * 100;

        if (visiblePercent > maxVisiblePercent) {
          maxVisiblePercent = visiblePercent;
          foundSection = section;
        }
      }
    }

    if (foundSection && maxVisiblePercent > 20) {
      setActiveSection(foundSection);
    } else {
      setActiveSection(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const handleScroll = () => {
      if (timeoutRef.current) {
        cancelAnimationFrame(timeoutRef.current);
      }
      timeoutRef.current = requestAnimationFrame(checkActiveSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(checkActiveSection, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        cancelAnimationFrame(timeoutRef.current);
      }
    };
  }, [location.pathname, checkActiveSection]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      lastClickedRef.current = null;
      lockActiveRef.current = false;
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
    }
  }, [location.pathname]);

  const fetchUserData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const roles = payload.roles || [];
      setUserRoles(roles);

      const profileRes = await api.get("/profiles/me");
      const userData = profileRes.data;
      setCurrentUser({
        id: userData.id,
        username: userData.account?.username || userData.username,
        fullName: userData.fullName,
        avatarUrl: userData.avatarUrl,
      });
    } catch (error) {
      console.error("❌ Lỗi fetch user data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.pathname]);

  const isLecturerPage = location.pathname.startsWith("/lecturer");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isLoginPage =
    location.pathname === "/login" || 
    location.pathname === "/register" || 
    location.pathname === "/forgot-password" || 
    location.pathname === "/reset-password";
  const isHomePage = location.pathname === "/";

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", null, {
          params: { refreshToken },
        });
      }
    } catch (error) {
      console.error("Lỗi logout:", error);
    } finally {
      localStorage.clear();
      setCurrentUser(null);
      setUserRoles([]);
      navigate("/login");
    }
  };

  const hasManagementAccess = () => {
    return userRoles.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r));
  };

  const hasOrganizerAccess = () => {
    return userRoles.some((r) => ["ORGANIZER"].includes(r));
  };

  const hasLecturerAccess = () => {
    return userRoles.some((r) =>
      ["ADMIN", "SUPER_ADMIN", "ORGANIZER", "MEMBER"].includes(r),
    );
  };

  const getManagementPath = () => {
    if (userRoles.includes("SUPER_ADMIN")) {
      return "/admin";
    } else if (userRoles.includes("ADMIN") || userRoles.includes("ORGANIZER")) {
      return "/lecturer/events/feed";
    } else if (userRoles.includes("MEMBER")) {
      return "/lecturer/events/feed";
    }
    return null;
  };

  const getManagementButtonText = () => {
    if (userRoles.includes("SUPER_ADMIN")) {
      return "Quản trị hệ thống";
    } else if (
      userRoles.includes("ADMIN") ||
      userRoles.includes("ORGANIZER") ||
      userRoles.includes("MEMBER")
    ) {
      return "Quản lý";
    }
    return null;
  };

  const getManagementButtonClass = () => {
    const baseClass =
      "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200";

    const isInManagementPage = isLecturerPage || isAdminPage;

    if (userRoles.includes("SUPER_ADMIN")) {
      return `${baseClass} ${
        isInManagementPage
          ? "text-purple-600 bg-purple-50"
          : "text-slate-600 hover:text-purple-600 hover:bg-purple-50"
      }`;
    } else {
      return `${baseClass} ${
        isInManagementPage
          ? "text-orange-600 bg-orange-50"
          : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
      }`;
    }
  };

  const getPrimaryRole = () => {
    if (userRoles.length === 0) return "Thành viên";

    const rolePriority = [
      "SUPER_ADMIN",
      "ADMIN",
      "ORGANIZER",
      "MEMBER",
      "EVENT_PARTICIPANT",
      "GUEST",
    ];

    for (const priorityRole of rolePriority) {
      if (userRoles.includes(priorityRole)) {
        return roleMap[priorityRole] || "Thành viên";
      }
    }

    return roleMap[userRoles[0]] || "Thành viên";
  };

  const getMenuItemClass = (itemId) => {
    const baseClass =
      "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200";

    if (isHomePage) {
      return `${baseClass} ${
        activeSection === itemId
          ? "text-orange-600 bg-orange-50"
          : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
      }`;
    }
    return `${baseClass} text-slate-600 hover:text-orange-600 hover:bg-orange-50`;
  };

  const getAttendanceClass = () => {
    const baseClass =
      "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200";
    return `${baseClass} ${
      location.pathname === "/attendance"
        ? "text-orange-600 bg-orange-50"
        : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
    }`;
  };

  const handleMenuItemClick = (itemId) => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
    }

    lastClickedRef.current = itemId;

    lockActiveRef.current = true;

    isScrollingRef.current = true;

    setActiveSection(itemId);

    const scrollToSection = () => {
      const el = document.getElementById(itemId);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      } else {
        isScrollingRef.current = false;
      }
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToSection, 300);
    } else {
      scrollToSection();
    }

    lockTimerRef.current = setTimeout(() => {
      lockActiveRef.current = false;
      checkActiveSection();
    }, 1500);
  };

  useEffect(() => {
    const handleEventFeedReady = () => {
      setTimeout(checkActiveSection, 100);
    };

    window.addEventListener("eventFeedReady", handleEventFeedReady);

    return () => {
      window.removeEventListener("eventFeedReady", handleEventFeedReady);
    };
  }, [checkActiveSection]);

  if (loading) {
    return (
      <header className="w-full font-sans sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="bg-linear-to-r from-[#1a479a] to-[#2563eb] text-white py-1.5 px-4 md:px-10">
          <div className="flex justify-between items-center">
            <div>Hệ thống Quản lý Sự kiện IUH</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="w-full font-sans sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="bg-linear-to-r from-[#1a479a] to-[#2563eb] text-white py-1.5 px-4 md:px-10 flex justify-between items-center text-[11px] font-medium tracking-wide">
          <div className="hidden md:flex items-center gap-2 opacity-90">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Hệ thống Quản lý Sự kiện IUH - Chào mừng bạn quay trở lại
          </div>

          <div className="flex items-center gap-5 ml-auto">
            <button className="hover:text-orange-300 transition-colors flex items-center gap-1">
              <Mail size={12} /> Hỗ trợ kỹ thuật
            </button>
            <div className="h-3 w-px bg-white/20"></div>
            <div className="flex items-center gap-1.5 cursor-pointer group">
              <Globe
                size={12}
                className="group-hover:rotate-12 transition-transform"
              />
              <span>Tiếng Việt (VN)</span>
            </div>
          </div>
        </div>

        {!isLoginPage && (
          <div className="w-full mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
            <div
              className="cursor-pointer transition-all duration-300 hover:opacity-80 active:scale-95"
              onClick={() => navigate("/")}
            >
              <img
                src={logo_iuh}
                alt="IUH Logo"
                className="h-10 md:h-12 object-contain"
              />
            </div>

            {!isLecturerPage && !isAdminPage && (
              <nav className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => handleMenuItemClick("gioi-thieu")}
                  className={getMenuItemClass("gioi-thieu")}
                >
                  Giới thiệu
                </button>

                <button
                  onClick={() => handleMenuItemClick("su-kien")}
                  className={getMenuItemClass("su-kien")}
                >
                  Sự kiện
                </button>

                <a href="/attendance" className={getAttendanceClass()}>
                  Điểm danh
                </a>

                {hasLecturerAccess() && getManagementPath() && (
                  <a
                    href={getManagementPath()}
                    className={getManagementButtonClass()}
                  >
                    {getManagementButtonText()}
                  </a>
                )}
              </nav>
            )}

            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
              {currentUser ? (
                <div className="relative" ref={menuRef}>
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="relative">
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                          {currentUser.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none">
                        {currentUser.fullName || currentUser.username}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-tighter">
                        {getPrimaryRole()}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 bg-linear-to-br from-slate-50 to-white border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                          Tài khoản của bạn
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                            {currentUser.username?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {currentUser.fullName || currentUser.username}
                            </p>
                            <p className="text-[11px] text-orange-600 font-bold flex items-center gap-1">
                              <ShieldCheck size={12} />
                              {getPrimaryRole()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        {hasLecturerAccess() && getManagementPath() && (
                          <>
                            <button
                              onClick={() => {
                                navigate(getManagementPath());
                                setIsMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors"
                            >
                              <ShieldCheck
                                size={16}
                                className="text-slate-400"
                              />
                              {getManagementButtonText()}
                            </button>
                            <div className="border-t border-slate-100 my-2"></div>
                          </>
                        )}

                        <button
                          onClick={() => {
                            navigate("/userprofile");
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors"
                        >
                          <User size={16} className="text-slate-400" /> Hồ sơ cá
                          nhân
                        </button>

                        <button
                          onClick={() => {
                            navigate("/settings");
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors"
                        >
                          <Settings size={16} className="text-slate-400" /> Cài
                          đặt tài khoản
                        </button>
                      </div>

                      <div className="p-2 bg-slate-50 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                        >
                          <LogOut size={16} /> Đăng xuất hệ thống
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
                  <LogIn
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">
                Xác nhận đăng xuất?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-2xl font-bold bg-rose-500 text-white shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all text-sm uppercase"
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
