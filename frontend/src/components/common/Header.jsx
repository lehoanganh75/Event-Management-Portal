import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Search, Mail, User, GraduationCap, Globe } from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { useEffect, useState } from "react";

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Trưởng Khoa",
  EVENT_MANAGER: "Giảng viên",
  LECTURER: "Giảng viên",
  ORGANIZER: "Ban Tổ Chức",
  STUDENT: "Sinh viên",
};

const Header = ({ user, onLogin, showAuthButtons = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLecturerPage = location.pathname.startsWith("/lecturer");

  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/register";

  // const activeClass = "text-orange-500 font-bold";
  // const normalClass = "text-gray-700 hover:text-[#1a479a] transition-colors";
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (location.pathname !== "/") {
      // setActiveSection(null);
      return;
    }

    const sections = ["gioi-thieu", "su-kien"];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;

        const best = visible.reduce((prev, current) => {
          return Math.abs(current.boundingClientRect.top) <
            Math.abs(prev.boundingClientRect.top)
            ? current
            : prev;
        });

        setActiveSection(best.target.id);
      },
      {
        root: null,
        rootMargin: "-120px 0px -60% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection("gioi-thieu");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  return (
    <header className="w-full font-sans sticky top-0 z-50 bg-white">
      <div className="bg-[#1a479a] text-white py-2 px-4 md:px-10 flex flex-wrap justify-between items-center text-sm">
        <div className="hidden md:block">
          Chào mừng bạn đến với Đại học Công nghiệp Thành phố Hồ Chí Minh
        </div>

        <div className="flex items-center gap-6 ml-auto">
          <a
            href="/login"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <User size={16} /> Giảng viên
          </a>
          <a
            href="/login"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <Mail size={16} /> Email
          </a>
          <a
            href="/login"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <GraduationCap size={16} /> Sinh viên
          </a>

          <div className="h-4 w-px bg-white/30 mx-1"></div>

          <button className="hover:text-gray-200">
            <Search size={18} />
          </button>

          <div className="flex items-center gap-1 bg-white text-[#1a479a] px-2 py-0.5 rounded-md font-bold text-xs cursor-pointer">
            <Globe size={14} /> VNI
          </div>
        </div>
      </div>

      {!isLoginPage && (
        <div className="bg-white shadow-sm px-4 md:px-10 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo_iuh}
              alt="IUH Logo"
              className="h-16 object-contain"
            />
          </div>

          {!isLecturerPage && (
            <nav className="flex flex-wrap justify-center gap-6 font-semibold uppercase text-sm">
              {/* GIỚI THIỆU */}
              <a
                onClick={() => {
                  if (location.pathname !== "/") {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById("gioi-thieu");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }, 300);
                  } else {
                    const el = document.getElementById("gioi-thieu");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className={`cursor-pointer ${
                  activeSection === "gioi-thieu"
                    ? "text-orange-500 font-bold"
                    : "text-gray-700 hover:text-[#1a479a]"
                }`}
              >
                Giới thiệu
              </a>

              {/* SỰ KIỆN */}
              <a
                onClick={() => {
                  if (location.pathname !== "/") {
                    navigate("/");
                    setTimeout(() => {
                      const el = document.getElementById("su-kien");
                      if (el) {
                        const yOffset = -140; 
                        const y =
                          el.getBoundingClientRect().top +
                          window.pageYOffset +
                          yOffset;
                        window.scrollTo({ top: y, behavior: "smooth" });
                        setActiveSection("su-kien");
                      }
                    }, 300);
                  } else {
                    const el = document.getElementById("su-kien");
                    if (el) {
                      const yOffset = -140;
                      const y =
                        el.getBoundingClientRect().top +
                        window.pageYOffset +
                        yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                      setActiveSection("su-kien");
                    }
                  }
                }}
                className={`cursor-pointer ${
                  activeSection === "su-kien"
                    ? "text-orange-500 font-bold"
                    : "text-gray-700 hover:text-[#1a479a]"
                }`}
              >
                Sự kiện
              </a>

              {/* ĐIỂM DANH */}
              <a
                href="/attendance"
                className={
                  location.pathname === "/attendance"
                    ? "text-orange-500 font-bold"
                    : "text-gray-700 hover:text-[#1a479a]"
                }
              >
                Điểm danh
              </a>

              {/* QUẢN LÝ */}
              <a
                onClick={() => navigate("/lecturer/events/feed")}
                className={`cursor-pointer ${
                  location.pathname.includes("/lecturer")
                    ? "text-orange-500 font-bold"
                    : "text-gray-700 hover:text-[#1a479a]"
                }`}
              >
                Quản lý
              </a>
            </nav>
          )}

          {/* User Auth Section */}
          <div className="flex items-center gap-4 border-l pl-6">
            {user?.data ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {user.data.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {roleMap[user.data.roles[0]?.role] || "Thành viên"}
                  </p>
                </div>
                <img
                  src={
                    user.data.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <button className="ml-2 text-xs font-bold text-red-600 hover:underline">
                  Đăng xuất
                </button>
              </div>
            ) : (
              showAuthButtons && (
                <button
                  onClick={onLogin}
                  className="flex items-center gap-2 bg-[#1a479a] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-800 transition-all"
                >
                  <LogIn size={16} /> ĐĂNG NHẬP
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
