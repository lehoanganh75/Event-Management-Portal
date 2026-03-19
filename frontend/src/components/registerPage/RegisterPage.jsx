import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  CalendarCheck,
  ArrowLeft,
  Users,
  QrCode,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo_iuh from "../../assets/images/logo_iuh.png";
import Notification from "../notification/Notification";
import ErrorNotification from "../notification/ErrorNotification";
import axios from "axios";
import Header from "../common/Header";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState("");
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

  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const trimmed = password.trim();
    const errs = [];
    if (!trimmed)
      return { isValid: false, errors: ["Mật khẩu không được để trống"] };
    if (trimmed.length < 8) errs.push("Ít nhất 8 ký tự");
    if (!/[A-Z]/.test(trimmed)) errs.push("Ít nhất 1 chữ hoa");
    if (!/[a-z]/.test(trimmed)) errs.push("Ít nhất 1 chữ thường");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed))
      errs.push("Ít nhất 1 ký tự đặc biệt");
    return { isValid: errs.length === 0, errors: errs };
  };

  const validateForm = () => {
    const newErrors = {};
    const d = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      dateOfBirth: formData.dateOfBirth.trim(),
      gender: formData.gender.trim(),
    };

    if (!d.fullName) newErrors.fullName = "Họ và tên không được để trống";
    if (!d.username) newErrors.username = "Tên đăng nhập không được để trống";
    if (!d.email) newErrors.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      newErrors.email = "Email không hợp lệ";

    const pwCheck = validatePassword(d.password);
    if (!pwCheck.isValid) newErrors.password = pwCheck.errors;

    const cpwCheck = validatePassword(d.confirmPassword);
    if (!cpwCheck.isValid) newErrors.confirmPassword = cpwCheck.errors;
    else if (d.password !== d.confirmPassword)
      newErrors.confirmPassword = ["Mật khẩu xác nhận không khớp"];

    if (!d.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
    } else {
      const birth = new Date(d.dateOfBirth);
      const today = new Date();
      if (birth > today) {
        newErrors.dateOfBirth = "Ngày sinh không được trong tương lai";
      } else {
        let age = today.getFullYear() - birth.getFullYear();
        if (
          today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() &&
            today.getDate() < birth.getDate())
        )
          age--;
        if (age < 10)
          newErrors.dateOfBirth = "Bạn phải trên 10 tuổi để đăng ký";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const API = "http://192.168.0.105:8082/api/auth/register";
      const response = await axios.post(API, {
        username: formData.username.trim(),
        password: formData.password.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        fullName: formData.fullName.trim(),
        gender: formData.gender.trim(),
      });

      if (response.data?.status === "success") {
        setMessage(response.data.message || "Đăng ký thành công!");
        setToastVisible(true);
        setFormData({
          fullName: "",
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
          dateOfBirth: "",
          gender: "OTHER",
        });
        setErrors({});
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      let msg = "Có lỗi xảy ra khi đăng ký tài khoản.";
      if (error.response?.data) {
        msg = error.response.data.message || msg;
        if (error.response.data.field) {
          setErrors((prev) => ({
            ...prev,
            [error.response.data.field]: error.response.data.message,
          }));
        }
      } else if (error.request) {
        msg = "Không kết nối được đến server. Vui lòng kiểm tra mạng.";
      }
      setErrorMessage(msg);
      setErrorToastVisible(true);
    }
  };

  const InputField = ({
    id,
    label,
    type = "text",
    value,
    placeholder,
    error,
    rightElement,
  }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
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
            error.map((e, i) => (
              <p key={i} className="text-xs text-red-500">
                {e}
              </p>
            ))
          ) : (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );

  const features = [
    {
      icon: CalendarCheck,
      title: "Quản lý sự kiện",
      desc: "Tạo và theo dõi toàn bộ sự kiện trong trường",
    },
    {
      icon: QrCode,
      title: "QR Check-in",
      desc: "Điểm danh nhanh chóng bằng mã QR cá nhân",
    },
    {
      icon: Users,
      title: "Quản lý người dùng",
      desc: "Phân quyền linh hoạt theo vai trò",
    },
    {
      icon: BarChart3,
      title: "Thống kê realtime",
      desc: "Báo cáo và phân tích dữ liệu tức thì",
    },
  ];

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-4 font-sans">
        <Notification
          toastVisible={toastVisible}
          setToastVisible={setToastVisible}
          notification="Vui lòng xác nhận email!"
          message={message}
        />
        <ErrorNotification
          toastVisible={errorToastVisible}
          setToastVisible={setErrorToastVisible}
          notification="Đăng ký thất bại!"
          message={errorMessage}
        />

        <div className="w-full max-w-5xl flex flex-col">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-sm font-semibold text-[#1a3a6b] hover:gap-3 transition-all duration-200 mb-4 self-start cursor-pointer"
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

          <div className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] overflow-hidden flex min-h-[600px]">
            <div className="hidden lg:flex lg:w-[42%] bg-[#1a3a6b] flex-col justify-between p-10 relative overflow-hidden">
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
                  Tham gia cùng
                  <br />
                  <span className="text-blue-300">Cộng đồng IUH</span>
                </h2>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Đăng ký để tham gia hàng trăm sự kiện, tích lũy điểm rèn luyện
                  và kết nối với cộng đồng sinh viên IUH.
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

            <div className="flex-1 flex flex-col justify-center px-8 py-8 lg:px-10 overflow-y-auto">
              <div className="lg:hidden flex flex-col items-center mb-6">
                <img
                  src={logo_iuh}
                  alt="IUH Logo"
                  className="h-12 object-contain mb-2"
                />
                <h1 className="text-xl font-bold text-[#1a3a6b]">
                  Hệ thống Sự kiện IUH
                </h1>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1a3a6b] tracking-tight">
                  Tạo tài khoản
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Điền thông tin để bắt đầu trải nghiệm
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="fullName"
                    label="Họ và tên"
                    value={formData.fullName}
                    placeholder="Nhập họ và tên"
                    error={errors.fullName}
                  />
                  <InputField
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    placeholder="Nhập địa chỉ email"
                    error={errors.email}
                  />
                </div>

                <InputField
                  id="username"
                  label="Tên đăng nhập"
                  value={formData.username}
                  placeholder="Nhập tên đăng nhập"
                  error={errors.username}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="password"
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    placeholder="Nhập mật khẩu"
                    error={errors.password}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    }
                  />
                  <InputField
                    id="confirmPassword"
                    label="Xác nhận mật khẩu"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    error={errors.confirmPassword}
                    rightElement={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày sinh
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all cursor-pointer ${
                        errors.dateOfBirth
                          ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                          : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/10"
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-xs text-red-500">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Giới tính
                    </label>
                    <div className="flex items-center gap-4 h-[42px]">
                      {[
                        ["MALE", "Nam"],
                        ["FEMALE", "Nữ"],
                        ["OTHER", "Khác"],
                      ].map(([val, label]) => (
                        <label
                          key={val}
                          className="flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={val}
                            checked={formData.gender === val}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: e.target.value,
                              }))
                            }
                            className="w-4 h-4 accent-[#1a3a6b] cursor-pointer"
                          />
                          <span className="text-sm text-gray-600">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2 hover:bg-[#15306b] active:scale-[0.98] shadow-lg shadow-[#1a3a6b]/25 cursor-pointer"
                >
                  Đăng ký ngay
                </button>

                <p className="text-center text-sm text-gray-400 pt-1">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[#1a3a6b] font-semibold hover:underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </form>

              <div className="mt-4 text-center text-xs text-gray-400 space-y-1">
                <p>Gặp vấn đề khi đăng ký?</p>
                <button className="text-[#1a3a6b] font-medium hover:underline cursor-pointer">
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

export default RegisterPage;
