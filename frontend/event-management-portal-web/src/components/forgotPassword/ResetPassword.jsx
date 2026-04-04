// src/pages/auth/ResetPassword.jsx
import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import logo_iuh from "../../assets/images/logo_iuh.png";
import Header from "../common/Header";
import { useAuth } from "../../context/AuthContext";

const PasswordInput = ({ id, label, value, show, onToggle, error, onChange }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Nhập mật khẩu..."
          className={`w-full px-4 py-2.5 pr-11 border rounded-lg text-sm outline-none transition-all placeholder:text-gray-300 ${
            error
              ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && (
        <div className="space-y-0.5">
          {Array.isArray(error)
            ? error.map((e, i) => <p key={i} className="text-xs text-red-500">{e}</p>)
            : <p className="text-xs text-red-500">{error}</p>
          }
        </div>
      )}
    </div>
  );

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { resetPassword } = useAuth();     // ← Lấy từ AuthContext

  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password) => {
    const errs = [];
    if (!password.trim()) errs.push("Mật khẩu không được để trống");
    if (password.length < 8) errs.push("Ít nhất 8 ký tự");
    if (!/[A-Z]/.test(password)) errs.push("Ít nhất 1 chữ hoa");
    if (!/[!@#$%^&*()]/.test(password)) errs.push("Ít nhất 1 ký tự đặc biệt");
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatus({
        type: "error",
        message: "Liên kết không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.",
      });
      return;
    }

    const newErrs = {};

    const pwErrs = validatePassword(formData.newPassword);
    if (pwErrs.length > 0) newErrs.newPassword = pwErrs;

    if (formData.newPassword !== formData.confirmPassword) {
      newErrs.confirmPassword = ["Mật khẩu xác nhận không khớp"];
    }

    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs);
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Gọi resetPassword từ AuthContext
      await resetPassword(token, formData.newPassword);

      setStatus({
        type: "success",
        message: "Mật khẩu của bạn đã được cập nhật thành công! Đang chuyển hướng đến trang đăng nhập...",
      });

      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      console.error("Reset password error:", error);

      const errorMsg = error.response?.data?.message 
        || "Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.";

      setStatus({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-[#eef2f7] flex flex-col items-center justify-center p-4 font-sans">
     <button
          onClick={() => navigate("/login")}
          className="group flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:gap-3 transition-all duration-200 mb-6"
        >
          <span className="w-8 h-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center group-hover:bg-[#1a3a6b] group-hover:border-[#1a3a6b] transition-all duration-200">
            <ArrowLeft
              size={15}
              className="text-[#1a3a6b] group-hover:text-white transition-colors duration-200"
            />
          </span>
          <span className="group-hover:text-[#15306b] transition-colors hover:cursor-pointer">
            Quay lại đăng nhập
          </span>
        </button>

      <div className="flex flex-col items-center mb-6">
        <img src={logo_iuh} alt="IUH Logo" className="h-14 object-contain mb-3" />
        <h1 className="text-[22px] font-bold text-[#1a3a6b] tracking-tight">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-400 mt-0.5">Nhập mật khẩu mới để tiếp tục</p>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="h-1 bg-[#1a3a6b]" />

        <div className="px-8 py-7 space-y-5">
          {status.message && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg text-sm border ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              )}
              <p>{status.message}</p>
            </div>
          )}

          {!token && (
            <div className="flex items-start gap-3 p-4 rounded-lg text-sm border bg-red-50 text-red-700 border-red-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>Liên kết không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.</p>
            </div>
          )}

          {status.type !== "success" && token && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                id="newPassword"
                label="Mật khẩu mới"
                value={formData.newPassword}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                error={errors.newPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                  if (errors.newPassword) {
                    setErrors(prev => ({ ...prev, newPassword: "" }));
                  }
                }}
              />

              <PasswordInput
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                error={errors.confirmPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }
                }}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-[#1a3a6b] text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#15306b] active:scale-[0.98] shadow-md shadow-[#1a3a6b]/25"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận đặt lại mật khẩu"
                )}
              </button>
            </form>
          )}

          {status.type === "success" && (
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-[#1a3a6b] text-white rounded-lg font-semibold text-sm hover:bg-[#15306b] active:scale-[0.98] shadow-md shadow-[#1a3a6b]/25 transition-all"
            >
              Đăng nhập ngay
            </button>
          )}

          <p className="text-center text-sm text-gray-400 pt-1">
            Nhớ mật khẩu rồi?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#1a3a6b] font-semibold hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>

      <div className="mt-5 text-center text-xs text-gray-400 space-y-1">
        <p>Gặp vấn đề khi đặt lại mật khẩu?</p>
        <button className="text-[#1a3a6b] font-medium hover:underline">
          Liên hệ bộ phận hỗ trợ
        </button>
      </div>
    </div>
    </div>
  );
};

export default ResetPassword;