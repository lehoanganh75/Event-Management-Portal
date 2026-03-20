import React, { useState, useEffect } from "react";
import { LogIn, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo_iuh from "../../assets/images/logo_iuh.png";
import Notification from "../notification/Notification";
import FloatingInput from "../custom/FloatingInput";
import ErrorNotification from "../notification/ErrorNotification";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  
  // States cho thông báo
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [errorToastVisible, setErrorToastVisible] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); // Tránh double-click
  
  const [formData, setFormData] = useState({
    username: "", 
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Cleanup timeout khi component unmount
  useEffect(() => {
    let timer;
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const username = formData.username.trim();
    const password = formData.password.trim();

    if (!username) newErrors.username = "Tên đăng nhập không được để trống";
    if (!password) newErrors.password = "Mật khẩu không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    const payload = {
      username: formData.username.trim(),
      password: formData.password
    };

    console.log(payload);
    

    try {
      const API_LOGIN = "http://localhost:8082/api/auth/login";
      const API_PROFILE = "http://localhost:8082/api/profiles/me";
      
      // 1. Gọi API Login
      const loginRes = await axios.post(API_LOGIN, payload);
      
      if (loginRes.data && loginRes.data.accessToken) {
        const { accessToken, refreshToken } = loginRes.data;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const profileRes = await axios.get(API_PROFILE, {
          headers: { 
            Authorization: `Bearer ${accessToken}` 
          }
        });

        const data = profileRes.data;

        const userData = {
          username: data?.username || data?.email?.split('@')[0] || "User",
          roles: Array.isArray(data?.roles) ? data.roles : ["GUEST"],
          email: data?.email || "",
          fullName: data?.fullName || "Chưa cập nhật",
          avatarUrl: data?.avatarUrl || null
        };

        localStorage.setItem("user", JSON.stringify(userData));

        setMessage("Đăng nhập thành công! Đang chuyển hướng...");
        setToastVisible(true);

        setTimeout(() => {
          if (userData.roles.includes("ADMIN") || userData.roles.includes("SUPER_ADMIN")) {
            navigate("/admin/dashboard");
          } else if (userData.roles.includes("LECTURER")) {
            navigate("/lecturer/dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Login Error:", error);
      let errorMsg = "Tên đăng nhập hoặc mật khẩu không chính xác.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      setErrorMessage(errorMsg);
      setErrorToastVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 antialiased font-sans">
      {/* Thành công */}
      <Notification
        toastVisible={toastVisible}
        setToastVisible={setToastVisible}
        notification="Thành công"
        message={message}
      />

      {/* Thất bại */}
      <ErrorNotification
        toastVisible={errorToastVisible}
        setToastVisible={setErrorToastVisible}
        notification="Đăng nhập thất bại!"
        message={errorMessage}
      />

      <div className="max-w-5xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-120">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="lg:w-[50%] bg-linear-to-br from-indigo-700 via-blue-700 to-cyan-600 p-10 text-white flex flex-col justify-between items-center text-center">           
          <div className="space-y-5">
            <img src={logo_iuh} alt="IUH Logo" className="h-20 brightness-0 invert mx-auto drop-shadow-lg" />
            <h1 className="text-lg font-semibold tracking-wide opacity-90 uppercase">
              Industrial University of Ho Chi Minh City
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Hệ thống quản lý sự kiện</h2>
            <p className="text-blue-100 text-base italic opacity-80">
              "Chào mừng bạn quay trở lại!"
            </p>
          </div>

          <div className="space-y-4 w-full">
            <p className="text-sm tracking-widest font-medium opacity-70">Bạn chưa có tài khoản?</p>
            <button 
              onClick={() => navigate("/register")}
              className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-base font-bold hover:bg-white hover:text-blue-700 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn size={20} /> Đăng ký ngay
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="lg:w-[50%] p-10 lg:p-16 flex flex-col justify-center bg-white">  
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-700 mb-3">
              Tài khoản của bản
            </h2>
            <div className="h-1 w-20 bg-linear-to-r from-indigo-600 to-blue-600 rounded-full"></div>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="relative">
              <FloatingInput
                id="username"
                label="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <FloatingInput
                id="password"
                label="Mật khẩu"
                isPassword
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />              
            </div>

            <div className="flex justify-end items-center -mt-4">
              <button 
                type="button"
                className="text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all duration-300"
              >
                <span className="bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Quên mật khẩu?
                </span>
              </button>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-80 py-4 bg-linear-to-r from-indigo-600 via-blue-700 to-sky-600 text-white text-base font-black rounded-2xl shadow-xl shadow-blue-100 transition-all duration-300 tracking-widest uppercase flex items-center justify-center gap-3 
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-blue-300 active:scale-95'}`}
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận đăng nhập"}
                {!isLoading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;