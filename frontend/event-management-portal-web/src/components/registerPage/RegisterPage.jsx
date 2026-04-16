import React, { useState, useEffect, useRef, memo } from "react";
import {
  Eye, EyeOff, Loader2, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import logo_iuh from "../../assets/images/logo_iuh.png";
import ErrorNotification from "../notification/ErrorNotification";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

/* ================= INPUT ================= */
const InputField = memo(({
  id, label, type = "text", value, error, onChange, rightElement
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
        }`}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
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
  const { register, resendOtp } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [countdown, setCountdown] = useState(60);

  const [errorToastVisible, setErrorToastVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  };

  /* ===== REGISTER ===== */
  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      await register(formData);
      setStep(3);
      setCountdown(60);
    } catch {
      setErrorMessage("Đăng ký thất bại");
      setErrorToastVisible(true);
    } finally {
      setIsSubmitting(false);
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
      setErrorMessage("OTP không hợp lệ");
      setErrorToastVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-4">
      <ErrorNotification
        toastVisible={errorToastVisible}
        setToastVisible={setErrorToastVisible}
        notification="Lỗi"
        message={errorMessage}
      />

      <div className="w-full max-w-5xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* LEFT */}
        <div className="hidden lg:flex w-[35%] bg-[#1a3a6b] text-white p-10 flex-col justify-between">
          <div>
            <img src={logo_iuh} className="h-10 mb-6 brightness-0 invert" />
            <h2 className="text-2xl font-bold leading-snug">
              Nền tảng quản lý <br /> sự kiện IUH
            </h2>
          </div>
          <p className="text-xs opacity-50">
            © {new Date().getFullYear()} IUH
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-10">
          <h1 className="text-2xl font-bold mb-2">Đăng ký</h1>

          <StepIndicator step={step} />

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <InputField id="fullName" label="Họ tên" value={formData.fullName} onChange={handleChange} />
              <InputField id="email" label="Email" value={formData.email} onChange={handleChange} />
              <InputField id="dateOfBirth" label="Ngày sinh" type="date" value={formData.dateOfBirth} onChange={handleChange} />

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl"
              >
                Tiếp tục
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <InputField id="username" label="Username" value={formData.username} onChange={handleChange} />

              <InputField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
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
                onChange={handleChange}
                rightElement={
                  <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-xl">
                  Quay lại
                </button>
                <button
                  onClick={handleRegister}
                  className="flex-1 bg-[#1a3a6b] text-white py-3 rounded-xl flex justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Gửi OTP"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="text-center space-y-5">
              <p>Nhập OTP</p>

              <div className="flex justify-center gap-2">
                {otp.map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    maxLength={1}
                    className="w-10 h-12 border text-center rounded-lg"
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl"
              >
                Xác nhận
              </button>

              <button
                disabled={countdown > 0}
                onClick={resendOtp}
                className="text-sm text-gray-500"
              >
                Gửi lại ({countdown}s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;