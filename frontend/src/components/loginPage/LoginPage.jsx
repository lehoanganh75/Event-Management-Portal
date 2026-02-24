import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import logo_iuh from "../../assets/images/logo_iuh.png";
import axios from "axios";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("sinhvien");
  
  // Quản lý trạng thái nhập liệu
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }
    
    setLoading(true);

    try {
      // Gọi API đến cổng 8080 (Auth-Service)
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        { username, password }
      );

      // Nhận dữ liệu gồm accessToken và userId (ví dụ: user-iuh-001)
      const { accessToken, userId } = response.data;

      // Lưu vào LocalStorage để các trang khác sử dụng
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userId", userId); 

      // Điều hướng đến trang thông báo dựa trên userId nhận được
      navigate(`/lecturer/notifications/${userId}`);
      
    } catch (error) {
      alert(
        "Đăng nhập thất bại: " +
          (error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Header Form */}
      <div className="p-6 relative text-center">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition"
        >
          <svg className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <img src={logo_iuh} alt="IUH Logo" className="h-16 mx-auto cursor-pointer" onClick={() => navigate("/")} />
        <h2 className="text-2xl font-bold text-[#1a479a] mt-4">Đăng Nhập</h2>
        <p className="text-gray-500 text-sm mt-3">Hệ thống Quản Lý Sự Kiện IUH</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
          
          {/* Tabs chuyển đổi đối tượng */}
          <div className="flex border-b">
            {["sinhvien", "giangvien"].map((type) => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`flex-1 py-4 font-bold text-sm transition-all ${
                  userType === type ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-400"
                }`}
              >
                {type === "sinhvien" ? "Sinh viên" : "Giảng viên"}
              </button>
            ))}
          </div>

          {/* Form đăng nhập thực tế */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {userType === "sinhvien" ? "Mã số sinh viên" : "Mã giảng viên"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={userType === "sinhvien" ? "Nhập mã số sinh viên" : "Nhập mã giảng viên"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-blue-600 font-semibold hover:underline">Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1a479a] text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a href="/register" className="text-blue-600 font-bold">Đăng ký ngay</a>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;