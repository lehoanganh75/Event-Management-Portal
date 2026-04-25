import React, { useState, useEffect, useRef, memo } from "react";
import {
  Eye, EyeOff, Loader2, ArrowRight, ChevronLeft,
  CalendarCheck, QrCode, Users, BarChart3, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import logo_iuh from "../../assets/images/logo_iuh.png";
import { showToast } from "../../utils/toast.jsx";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

/* ================= INPUT ================= */
const InputField = memo(({
  id, label, type = "text", value, error, onChange, onBlur, rightElement, placeholder, placeholderColor
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          '--placeholder-color': placeholderColor || '#9ca3af'
        }}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none placeholder-custom transition-all ${
          error ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
        }`}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
    {error && <p className="text-xs text-red-500 animate-fadeInDown">{error}</p>}
  </div>
));

/* ================= STEP INDICATOR (ARROW) ================= */
const StepIndicator = ({ step }) => {
  const steps = ["Thông tin", "Tài khoản", "OTP"];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const s = i + 1;
        const active = step >= s;

        return (
          <React.Fragment key={s}>
            {/* STEP */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition
                  ${active ? "bg-[#1a3a6b] text-white" : "bg-gray-200 text-gray-500"}
                `}
              >
                {s}
              </div>
              <span className="text-xs mt-2 text-gray-500">{label}</span>
            </div>

            {/* ARROW */}
            {s !== 3 && (
              <ArrowRight
                size={18}
                className={`mx-1 ${
                  step > s ? "text-[#1a3a6b]" : "text-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ================= MAIN ================= */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, resendOtp, checkEmail, checkUsername } = useAuth();

  const features = [
    { icon: CalendarCheck, title: "Quản lý sự kiện", desc: "Tạo và theo dõi toàn bộ sự kiện trong trường" },
    { icon: QrCode, title: "QR Check-in", desc: "Điểm danh nhanh chóng bằng mã QR cá nhân" },
    { icon: Users, title: "Quản lý người dùng", desc: "Phân quyền linh hoạt theo vai trò" },
    { icon: BarChart3, title: "Thống kê realtime", desc: "Báo cáo và phân tích dữ liệu tức thì" },
  ];

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [countdown, setCountdown] = useState(60);

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userType, setUserType] = useState("MEMBER");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "OTHER",
  });

  /* ===== countdown ===== */
  useEffect(() => {
    if (step !== 3) return;
    if (countdown === 0) return;

    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: "" }));
  };

  const handleCheckEmail = async () => {
    if (!formData.email || errors.email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return;

    try {
      const res = await checkEmail(formData.email);
      if (res.data) {
        setErrors(prev => ({ ...prev, email: "Email này đã được đăng ký vui lòng thử lại với email khác." }));
      }
    } catch (err) {}
  };

  const handleCheckUsername = async () => {
    if (!formData.username || errors.username) return;
    try {
      const res = await checkUsername(formData.username);
      if (res.data) {
        const typeLabel = userType === "MEMBER" ? "MSSV" : userType === "ADMIN" ? "MSGV" : "Tên đăng nhập";
        setErrors(prev => ({ ...prev, username: `${typeLabel} này đã tồn tại` }));
      }
    } catch (err) {}
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Họ tên không được để trống";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = userType === "MEMBER" ? "MSSV không được để trống" : userType === "ADMIN" ? "MSGV không được để trống" : "Tên đăng nhập không được để trống";
    }
    
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===== REGISTER ===== */
  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      await register({ ...formData, role: userType });
      setStep(3);
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      
      // Map common error messages to fields
      if (msg.toLowerCase().includes("email")) {
        setErrors({ email: msg });
        setStep(1); // Go back to fix email
      } else if (msg.toLowerCase().includes("tên đăng nhập") || msg.toLowerCase().includes("username") || msg.toLowerCase().includes("mssv") || msg.toLowerCase().includes("msgv")) {
        const typeLabel = userType === "MEMBER" ? "MSSV" : userType === "ADMIN" ? "MSGV" : "Tên đăng nhập";
        setErrors({ username: `${typeLabel} đã tồn tại` });
      } else {
        showToast(msg || "Đăng ký thất bại", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await resendOtp(formData.username);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      otpRefs.current[0]?.focus();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể gửi lại mã OTP", "error");
    }
  };

  /* ===== OTP ===== */
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;

    setIsSubmitting(true);
    try {
      await authService.verifyOtp(formData.username, code);
      navigate("/login");
    } catch {
      showToast("OTP không hợp lệ", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mb-6 flex justify-start">
        <button
          onClick={() => navigate("/login")}
          className="group flex hover:cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:gap-3 transition-all duration-200"
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
      </div>

      {/* ErrorNotification removed in favor of global showToast */}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-5xl flex bg-white rounded-3xl shadow-2xl overflow-hidden min-h-150"
      >
        {/* LEFT — Form (Swapped to Left) */}
        <motion.div 
          layoutId="form-panel"
          className="flex-1 p-10 flex flex-col justify-center"
        >
          <h1 className="text-2xl font-bold mb-2">Đăng ký</h1>

          <StepIndicator step={step} />

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <InputField id="fullName" label="Họ tên" value={formData.fullName} error={errors.fullName} placeholder="Nhập họ và tên" placeholderColor="#1a3a6b" onChange={handleChange} />
              <InputField id="email" label="Email" value={formData.email} error={errors.email} placeholder="Nhập địa chỉ email" placeholderColor="#1a3a6b" onChange={handleChange} onBlur={handleCheckEmail} />
              <InputField id="dateOfBirth" label="Ngày sinh" type="date" value={formData.dateOfBirth} error={errors.dateOfBirth} placeholderColor="#1a3a6b" onChange={handleChange} />

              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl font-semibold"
              >
                Tiếp tục
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              {/* ROLE SELECTOR */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 shadow-inner">
                {[
                  { id: "MEMBER", label: "Sinh viên" },
                  { id: "ADMIN", label: "Giảng viên" },
                  { id: "GUEST", label: "Vãng lai" },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setUserType(role.id)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                      userType === role.id
                        ? "bg-white text-[#1a3a6b] shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              <InputField 
                id="username" 
                label={userType === "MEMBER" ? "MSSV" : userType === "ADMIN" ? "MSGV" : "Tên đăng nhập"} 
                value={formData.username} 
                error={errors.username}
                placeholder={userType === "MEMBER" ? "Nhập MSSV" : userType === "ADMIN" ? "Nhập MSGV" : "Nhập tên đăng nhập"} 
                placeholderColor="#1a3a6b" 
                onChange={handleChange} 
                onBlur={handleCheckUsername}
              />

              <InputField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                error={errors.password}
                placeholder="Nhập mật khẩu"
                placeholderColor="#1a3a6b"
                onChange={handleChange}
                rightElement={
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <InputField
                id="confirmPassword"
                label="Confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                error={errors.confirmPassword}
                placeholder="Xác nhận mật khẩu"
                placeholderColor="#1a3a6b"
                onChange={handleChange}
                rightElement={
                  <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 transition font-semibold">
                  Quay lại
                </button>
                <button
                  onClick={handleRegister}
                  className="flex-1 bg-[#1a3a6b] text-white py-3 rounded-xl flex justify-center font-semibold"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Gửi OTP"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="text-center space-y-5">
              <p className="font-medium text-gray-600">Nhập mã xác thực OTP đã được gửi đến email của bạn</p>

              <div className="flex justify-center gap-2">
                {otp.map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    maxLength={1}
                    className="w-10 h-12 border text-center rounded-lg text-lg font-bold focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10 outline-none transition"
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl font-semibold"
              >
                Xác nhận
              </button>

              <button
                disabled={countdown > 0}
                onClick={handleResendOtp}
                className={`text-sm font-medium ${countdown > 0 ? "text-gray-400" : "text-blue-600 hover:underline"}`}
              >
                {countdown > 0 ? `Gửi lại mã OTP (${countdown}s)` : "Gửi lại mã OTP ngay"}
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-5">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#1a3a6b] font-semibold hover:underline hover:cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </p>

          <div className="mt-5 text-center text-xs text-gray-400 space-y-1">
            <p>Gặp vấn đề khi đăng ký?</p>
            <button
              type="button"
              className="text-[#1a3a6b] font-medium hover:underline hover:cursor-pointer"
            >
              Liên hệ bộ phận hỗ trợ
            </button>
          </div>
        </motion.div>

        {/* RIGHT — Branding (Swapped to Right) */}
        <motion.div 
          layoutId="branding-panel"
          className="hidden lg:flex lg:w-[48%] bg-[#1a3a6b] flex-col justify-between p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <img
                src={logo_iuh}
                alt="IUH"
                className="h-10 brightness-0 invert"
              />
            </div>

            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Tham gia ngay <br />
              <span className="text-blue-300">Cộng đồng IUH</span>
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Trở thành một phần của hệ thống quản lý sự kiện hiện đại,
              giúp bạn không bỏ lỡ bất kỳ hoạt động bổ ích nào.
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
              Tham gia cùng hàng nghìn sinh viên khác
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;