import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  CalendarCheck,
  Users,
  QrCode,
  BarChart3,
  ArrowLeft,
  CheckCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo_iuh from "../../assets/images/logo_iuh.png";
import ErrorNotification from "../notification/ErrorNotification";
import Header from "../common/Header";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();   // Lấy từ Context

  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [errorToastVisible, setErrorToastVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  // Toast tự tắt
  useEffect(() => {
    let timer;
    if (toastVisible) {
      timer = setTimeout(() => setToastVisible(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Tên đăng nhập không được để trống";
    if (!formData.password.trim()) newErrors.password = "Mật khẩu không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm lấy role từ JWT
  const getRoleFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;        // backend trả về "role" (string)
    } catch (error) {
      console.error("Không thể decode JWT:", error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setErrorToastVisible(false);

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });

      setMessage("Đăng nhập thành công! Đang chuyển hướng...");
      setToastVisible(true);

      // Lấy accessToken vừa được lưu trong AuthContext
      const accessToken = localStorage.getItem("accessToken");
      const userRole = getRoleFromToken(accessToken);

      // Chuyển hướng theo role
      setTimeout(() => {
        if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
          navigate("/admin");
        } else if (userRole === "LECTURER") {
          navigate("/lecturer");
        } else {
          navigate("/");                    // Student / User bình thường
        }
      }, 1300);

    } catch (error) {
      console.error("Login Error:", error);

      let errorMsg = "Tên đăng nhập hoặc mật khẩu không chính xác.";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setErrorToastVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: CalendarCheck, title: "Quản lý sự kiện", desc: "Tạo và theo dõi toàn bộ sự kiện trong trường" },
    { icon: QrCode, title: "QR Check-in", desc: "Điểm danh nhanh chóng bằng mã QR cá nhân" },
    { icon: Users, title: "Quản lý người dùng", desc: "Phân quyền linh hoạt theo vai trò" },
    { icon: BarChart3, title: "Thống kê realtime", desc: "Báo cáo và phân tích dữ liệu tức thì" },
  ];

  return (
    <div className="h-screen flex flex-col font-sans">
      <div className="flex-1 bg-[#eef2f7] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl flex flex-col">
          <button
            onClick={() => navigate("/")}
            className="group flex hover:cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:gap-3 transition-all duration-200 mb-6"
          >
            <span className="w-8 h-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center group-hover:bg-[#1a3a6b] group-hover:border-[#1a3a6b] transition-all duration-200">
              <ArrowLeft
                size={15}
                className="text-[#1a3a6b] group-hover:text-white transition-colors duration-200"
              />
            </span>
            <span className="group-hover:text-[#15306b] transition-colors">
              Quay lại
            </span>
          </button>

          {toastVisible && (
            <div className="fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out translate-x-0 opacity-100 scale-100">
              <div className="relative overflow-hidden w-full max-w-xl
                  bg-linear-to-r from-emerald-600 via-green-600 to-teal-600
                  text-white rounded-2xl shadow-2xl shadow-green-900/40
                  border border-white/10 backdrop-blur-xl">
                <div className="flex items-start gap-4 p-6">
                  <div className="shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center
                        rounded-full bg-white/15 backdrop-blur-md
                        border border-white/20 shadow-inner">
                      <CheckCircle size={26} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg tracking-tight">Thành công</p>
                    <p className="mt-1 text-white/90 text-sm leading-relaxed">{message}</p>
                  </div>
                  <button 
                    onClick={() => setToastVisible(false)} 
                    className="shrink-0 p-2 rounded-full hover:bg-white/15 transition duration-200"
                  >
                    <X size={20} className="text-white/80 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
          <ErrorNotification
            toastVisible={errorToastVisible}
            setToastVisible={setErrorToastVisible}
            notification="Đăng nhập thất bại!"
            message={errorMessage}
          />

          <div className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] overflow-hidden flex min-h-150">
            {/* LEFT — Branding */}
            <div className="hidden lg:flex lg:w-[52%] bg-[#1a3a6b] flex-col justify-between p-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <img
                    src={logo_iuh}
                    alt="IUH"
                    className="h-10 brightness-0 invert"
                  />
                  <div>
                    <p className="text-white font-bold text-sm leading-none">
                      IUH
                    </p>
                    <p className="text-blue-200 text-xs mt-0.5">
                      Đại học Công nghiệp TP.HCM
                    </p>
                  </div>
                </div>

                <h2 className="text-white text-3xl font-bold leading-tight mb-3">
                  Hệ thống Quản lý
                  <br />
                  <span className="text-blue-300">Sự kiện IUH</span>
                </h2>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Nền tảng số hóa toàn bộ quy trình tổ chức sự kiện — từ đăng
                  ký, check-in đến thống kê và báo cáo realtime.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-3">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                  >
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-none mb-0.5">
                        {title}
                      </p>
                      <p className="text-blue-200 text-xs">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-white/20">
                <div className="flex -space-x-2">
                  {["SV", "GV", "BT"].map((t) => (
                    <div
                      key={t}
                      className="w-8 h-8 bg-blue-400 rounded-full border-2 border-[#1a3a6b] flex items-center justify-center text-[10px] font-bold text-white"
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <p className="text-blue-200 text-xs">
                  Hàng nghìn người dùng tin tưởng sử dụng
                </p>
              </div>
            </div>

            {/* RIGHT — Form */}
            <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-12">
              <div className="lg:hidden flex flex-col items-center mb-8">
                <img
                  src={logo_iuh}
                  alt="IUH Logo"
                  className="h-12 object-contain mb-2"
                />
                <h1 className="text-xl font-bold text-[#1a3a6b]">
                  Hệ thống Sự kiện IUH
                </h1>
              </div>

              <div className="mb-7">
                <h2 className="text-2xl font-bold text-[#1a3a6b] tracking-tight">
                  Đăng nhập
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Chào mừng bạn quay trở lại!
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all placeholder:text-gray-300 ${
                      errors.username
                        ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
                    }`}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500">{errors.username}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm outline-none transition-all placeholder:text-gray-300 ${
                        errors.password
                          ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                          : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#1a3a6b] cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-[#1a3a6b] font-semibold hover:underline hover:cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-[#15306b] active:scale-[0.98] shadow-lg shadow-[#1a3a6b]/25"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-[#1a3a6b] font-semibold hover:underline hover:cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </p>

              <div className="mt-5 text-center text-xs text-gray-400 space-y-1">
                <p>Gặp vấn đề khi đăng nhập?</p>
                <button
                  type="button"
                  className="text-[#1a3a6b] font-medium hover:underline hover:cursor-pointer"
                >
                  Liên hệ bộ phận hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
