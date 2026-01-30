import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import logo_iuh from "../../assets/images/logo_iuh.png";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("sinhvien");

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Header Form */}
      <div className="pt-10 pb-6 relative text-center">
        {/* NÚT QUAY LẠI */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition"
          title="Quay lại"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <img src={logo_iuh} alt="IUH Logo" className="h-16 mx-auto" />
        <h2 className="text-center text-2xl font-bold text-[#1a479a] mt-4">
          Đăng Ký Tài Khoản
        </h2>
        <p className="text-center text-gray-500 text-sm mt-3">
          Tạo tài khoản mới để tham gia hệ thống sự kiện IUH
        </p>
      </div>

      <div className="flex-1 flex items-start justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setUserType("sinhvien")}
              className={`flex-1 py-4 font-bold text-sm ${
                userType === "sinhvien"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-400"
              }`}
            >
              Sinh viên
            </button>
            <button
              onClick={() => setUserType("giangvien")}
              className={`flex-1 py-4 font-bold text-sm ${
                userType === "giangvien"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-400"
              }`}
            >
              Giảng viên
            </button>
          </div>

          {/* Form */}
          <div className="p-6 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ và tên */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="student@iuh.edu.vn"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="0123456789"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* MSSV / MGV */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {userType === "sinhvien"
                    ? "Mã số sinh viên"
                    : "Mã số giảng viên"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="20001234"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Khoa */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Khoa <span className="text-red-500">*</span>
                </label>
                <select className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white appearance-none">
                  <option value="">Chọn khoa</option>
                  <option value="cntt">Công nghệ thông tin</option>
                  <option value="ck">Cơ khí</option>
                  <option value="nn">Ngoại ngữ</option>
                </select>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Điều khoản */}
            <div className="flex items-start gap-3 px-1 py-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 leading-relaxed"
              >
                Tôi đồng ý với{" "}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-blue-600 font-bold hover:underline">
                  Chính sách bảo mật
                </a>{" "}
                của IUH
              </label>
            </div>

            <button className="w-full py-4 bg-[#1a479a] text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg">
              Đăng ký
            </button>

       <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
               <a href="/register" className="text-blue-600 font-bold">
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Hỗ trợ */}
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">Gặp vấn đề khi đăng nhập?</p>
        <a href="#" className="text-[#1a479a] font-bold text-sm">
          Liên hệ bộ phận hỗ trợ
        </a>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
