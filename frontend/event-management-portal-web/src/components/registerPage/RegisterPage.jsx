import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Eye, EyeOff, CalendarCheck, ArrowLeft, Users, QrCode,
  BarChart3, CheckCircle, X, AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo_iuh from "../../assets/images/logo_iuh.png";
import ErrorNotification from "../notification/ErrorNotification";
// SỬA: Import authApi từ file gộp trung tâm
import { authApi } from "../../api/authApi";
import Header from "../common/Header";
import { AnimatePresence } from "framer-motion";

const InputField = memo(({
  id, label, type = "text", value, placeholder, error, rightElement, onChange
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all placeholder:text-gray-300 ${
          rightElement ? "pr-11" : ""
        } ${
          error
            ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
        }`}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <div className="space-y-0.5">
        {Array.isArray(error) ? (
          error.map((e, idx) => (
            <p key={`${e}-${idx}`} className="text-xs text-red-500">{e}</p>
          ))
        ) : (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )}
  </div>
));

const RegisterPage = () => {
  const navigate = useNavigate();
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [errorToastVisible, setErrorToastVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "OTHER",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let timer;
    if (toastVisible) {
      timer = setTimeout(() => setToastVisible(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const validatePassword = useCallback((password) => {
    const trimmed = password.trim();
    const errs = [];
    if (!trimmed) return { isValid: false, errors: ["Mật khẩu không được để trống"] };
    if (trimmed.length < 8) errs.push("Ít nhất 8 ký tự");
    if (!/[A-Z]/.test(trimmed)) errs.push("Ít nhất 1 chữ hoa");
    if (!/[a-z]/.test(trimmed)) errs.push("Ít nhất 1 chữ thường");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed))
      errs.push("Ít nhất 1 ký tự đặc biệt");
    return { isValid: errs.length === 0, errors: errs };
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const d = { ...formData };

    if (!d.fullName.trim()) newErrors.fullName = "Họ và tên không được để trống";
    if (!d.username.trim()) newErrors.username = "Tên đăng nhập không được để trống";
    if (!d.email.trim()) newErrors.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      newErrors.email = "Email không hợp lệ";

    const pwCheck = validatePassword(d.password);
    if (!pwCheck.isValid) newErrors.password = pwCheck.errors;

    if (d.password !== d.confirmPassword)
      newErrors.confirmPassword = ["Mật khẩu xác nhận không khớp"];

    if (!d.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validatePassword]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[id];
        return newErrs;
      });
    }
  }, [errors]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // SỬ DỤNG authApi: Tự động gửi đến Gateway và xử lý CORS
      const payload = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        fullName: formData.fullName.trim(),
        gender: formData.gender.trim(),
      }; 

      const response = await authApi.register(payload);

      // Xử lý thành công
      setMessage(response.data?.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      setToastVisible(true);
      
      // Reset form
      setFormData({
        fullName: "", email: "", username: "",
        password: "", confirmPassword: "",
        dateOfBirth: "", gender: "OTHER",
      });

      // Chuyển hướng sau 3s
      setTimeout(() => navigate("/login"), 3500);

    } catch (error) {
      console.error("Register error:", error);
      
      // 1. Lấy message tổng quát từ server (dựa vào cấu trúc Map của GlobalExceptionHandler)
      const serverErrorMsg = error.response?.data?.message || "Đăng ký thất bại";
      const errorField = error.response?.data?.field; // Lấy field từ backend gửi về

      console.log(serverErrorMsg);
      

      let finalMsg = serverErrorMsg;

      if (error.response?.data) {
        // 2. Nếu có field cụ thể, đẩy lỗi vào state errors của ô input đó
        if (errorField) {
          setErrors(prev => ({ ...prev, [errorField]: serverErrorMsg }));
        }
      } else if (error.request) {
        finalMsg = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.";
      }
      
      // 3. Hiển thị thông báo lỗi lên Toast/Error Notification
      setErrorMessage(finalMsg);
      setErrorToastVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: CalendarCheck, title: "Quản lý sự kiện", desc: "Tổ chức và tham gia sự kiện dễ dàng" },
    { icon: QrCode, title: "QR Check-in", desc: "Điểm danh nhanh chóng, chính xác" },
    { icon: Users, title: "Cộng đồng", desc: "Kết nối sinh viên và giảng viên IUH" },
    { icon: BarChart3, title: "Tích lũy", desc: "Theo dõi điểm rèn luyện minh bạch" },
  ];

  return (
    <div className="min-h-screen bg-[#eef2f7] font-sans flex flex-col">
      <Header />
      
      <div className="grow flex items-center justify-center p-4">
        {/* Toast Success */}
        <AnimatePresence>
          {toastVisible && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="fixed top-24 right-6 z-50 bg-white border-l-4 border-emerald-500 rounded-xl shadow-2xl p-6 max-w-md"
            >
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Đăng ký thành công!</h3>
                  <p className="text-sm text-slate-500 mt-1">{message}</p>
                </div>
                <X size={18} className="text-slate-300 cursor-pointer" onClick={() => setToastVisible(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ErrorNotification
          toastVisible={errorToastVisible}
          setToastVisible={setErrorToastVisible}
          notification="Đăng ký thất bại!"
          message={errorMessage}
        />

        <div className="w-full max-w-5xl flex flex-col gap-4">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm font-bold text-[#1a3a6b] hover:gap-3 transition-all self-start cursor-pointer group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Quay lại đăng nhập
          </button>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex min-h-[600px] border border-white">
            {/* Left Side: Branding */}
            <div className="hidden lg:flex lg:w-[40%] bg-[#1a3a6b] flex-col justify-between p-12 relative overflow-hidden text-white">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <img src={logo_iuh} alt="IUH" className="h-12 brightness-0 invert mb-8" />
                <h2 className="text-3xl font-black leading-tight mb-4">
                  Bắt đầu hành trình <br /> <span className="text-blue-300">số hóa sự kiện</span>
                </h2>
                <p className="text-blue-100/80 text-sm leading-relaxed mb-10">
                  Tham gia cộng đồng IUH để quản lý và tham gia các hoạt động ngoại khóa một cách chuyên nghiệp nhất.
                </p>

                <div className="space-y-4">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-300">
                        <f.icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none mb-1">{f.title}</p>
                        <p className="text-[11px] text-blue-200/70">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="relative z-10 text-[10px] uppercase tracking-widest font-bold text-blue-300/50">
                © {new Date().getFullYear()} Industrial University of Ho Chi Minh City
              </p>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tạo tài khoản</h1>
                <p className="text-slate-400 text-sm mt-2">Đại học Công nghiệp Thành phố Hồ Chí Minh</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    id="fullName" label="Họ và tên" value={formData.fullName}
                    placeholder="Nguyễn Văn A" error={errors.fullName} onChange={handleChange}
                  />
                  <InputField
                    id="email" label="Email" type="email" value={formData.email}
                    placeholder="example@student.iuh.edu.vn" error={errors.email} onChange={handleChange}
                  />
                </div>

                <InputField
                  id="username" label="Tên đăng nhập" value={formData.username}
                  placeholder="20xxxxxx" error={errors.username} onChange={handleChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    id="password" label="Mật khẩu" type={showPassword ? "text" : "password"}
                    value={formData.password} placeholder="••••••••" error={errors.password}
                    onChange={handleChange}
                    rightElement={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  <InputField
                    id="confirmPassword" label="Xác nhận mật khẩu" type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword} placeholder="••••••••" error={errors.confirmPassword}
                    onChange={handleChange}
                    rightElement={
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    id="dateOfBirth" label="Ngày sinh" type="date" value={formData.dateOfBirth}
                    error={errors.dateOfBirth} onChange={handleChange}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                    <div className="flex items-center gap-4 h-[46px]">
                      {[["MALE", "Nam"], ["FEMALE", "Nữ"], ["OTHER", "Khác"]].map(([val, label]) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio" name="gender" value={val}
                            checked={formData.gender === val}
                            onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                            className="w-4 h-4 accent-[#1a3a6b]"
                          />
                          <span className="text-sm text-slate-600 font-medium group-hover:text-[#1a3a6b]">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#1a3a6b] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-[#15306b] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "ĐĂNG KÝ TÀI KHOẢN"
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 font-medium">
                  Đã có tài khoản?{" "}
                  <button type="button" onClick={() => navigate("/login")} className="text-[#1a3a6b] font-black hover:underline cursor-pointer">
                    ĐĂNG NHẬP
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;