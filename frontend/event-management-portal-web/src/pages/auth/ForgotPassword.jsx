import React, { useState } from "react";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo_iuh from "../../assets/images/logo_iuh.png";
import Header from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();     // ← Lấy từ AuthContext

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation frontend
    if (!email.trim()) {
      setError("Email không được để trống");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });
    setError("");

    try {
      // Gọi hàm từ AuthContext (đã dùng identityService.forgotPassword bên trong)
      await forgotPassword(email.trim());

      setMessage({
        type: "success",
        content: "Một liên kết khôi phục mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư rác/spam)!",
      });
      
      // Clear input sau khi gửi thành công
      setEmail("");
      
    } catch (err) {
      console.error("Forgot password error:", err);
      
      const errorMsg = err.response?.data?.message 
        || "Email không tồn tại trong hệ thống hoặc có lỗi xảy ra. Vui lòng thử lại.";

      setMessage({
        type: "error",
        content: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div><Header />
    <div className="min-h-screen bg-[#eef2f7] flex flex-col items-center justify-center p-4 font-sans">
     <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:gap-3 transition-all duration-200 mb-6"
        >
          <span className="w-8 h-8 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center group-hover:bg-[#1a3a6b] group-hover:border-[#1a3a6b] transition-all duration-200">
            <ArrowLeft
              size={15}
              className="text-[#1a3a6b] group-hover:text-white transition-colors duration-200"
            />
          </span>
          <span className="group-hover:text-[#15306b] transition-colors hover:cursor-pointer">
            Quay lại
          </span>
        </button>

      <div className="flex flex-col items-center mb-6">
        <img src={logo_iuh} alt="IUH Logo" className="h-14 object-contain mb-3" />
        <h1 className="text-[22px] font-bold text-[#1a3a6b] tracking-tight">Quên mật khẩu?</h1>
        <p className="text-sm text-gray-400 mt-0.5 text-center max-w-xs">
          Đừng lo, chúng tôi sẽ gửi hướng dẫn khôi phục đến email của bạn
        </p>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="h-1 bg-[#1a3a6b]" />

        <div className="px-8 py-7 space-y-5">
          {message.content && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg text-sm border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              )}
              <p>{message.content}</p>
            </div>
          )}

          {message.type !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ Email đăng ký
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="example@iuh.edu.vn"
                    className={`w-full px-4 py-2.5 pl-10 border rounded-lg text-sm outline-none transition-all placeholder:text-gray-300 ${
                      error
                        ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
                    }`}
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-[#1a3a6b] text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#15306b] active:scale-[0.98] shadow-md shadow-[#1a3a6b]/25"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu khôi phục"
                )}
              </button>
            </form>
          )}

          {message.type === "success" && (
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-[#1a3a6b] text-white rounded-lg font-semibold text-sm hover:bg-[#15306b] active:scale-[0.98] shadow-md shadow-[#1a3a6b]/25 transition-all"
            >
              Quay lại đăng nhập
            </button>
          )}

          <p className="text-center text-sm text-gray-400 pt-1">
            Nhớ mật khẩu rồi?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#1a3a6b] font-semibold hover:underline hover:cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>

      <div className="mt-5 text-center text-xs text-gray-400 space-y-1">
        <p>Gặp vấn đề khi khôi phục?</p>
        <button className="text-[#1a3a6b] font-medium hover:underline">
          Liên hệ bộ phận hỗ trợ
        </button>
      </div>
    </div>
    </div>
  );
};

export default ForgotPassword;