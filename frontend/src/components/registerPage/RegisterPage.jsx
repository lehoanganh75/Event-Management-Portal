import React, { useState } from "react";
import { LogIn } from "lucide-react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import Notification from "../notification/Notification";
import FloatingInput from "../custom/FloatingInput";
import axios from "axios";
import { ca } from "date-fns/locale";
import ErrorNotification from "../notification/ErrorNotification";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [errorToastVisible, setErrorToastVisible] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "other",
  });

  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const trimmed = password.trim();

    const errors = [];

    if (!trimmed) {
      errors.push("Mật khẩu không được để trống");
      return { isValid: false, errors };
    }

    if (trimmed.length < 8) {
      errors.push("Mật khẩu phải có ít nhất 8 ký tự");
    }

    if (!/[A-Z]/.test(trimmed)) {
      errors.push("Phải có ít nhất 1 chữ cái in hoa (A-Z)");
    }

    if (!/[a-z]/.test(trimmed)) {
      errors.push("Phải có ít nhất 1 chữ cái thường (a-z)");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed)) {
      errors.push("Phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*... etc)");
    }

    const isValid = errors.length === 0;

    return { isValid, errors };
  };

  const validateForm = () => {
    const newErrors = {};

    const trimmedData = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      dateOfBirth: formData.dateOfBirth.trim(), 
      gender: formData.gender.trim(),
    };

    console.log("Dữ liệu sau khi trim:", trimmedData);

    if (!trimmedData.fullName) newErrors.fullName = "Họ và tên không được để trống";
    if (!trimmedData.username) newErrors.username = "Tên đăng nhập không được để trống";

    if (!trimmedData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    const passwordCheck = validatePassword(trimmedData.password);

    if (!passwordCheck.isValid) {
      newErrors.password = passwordCheck.errors; 
    }

    const confirmPasswordCheck = validatePassword(trimmedData.confirmPassword);

    if (!confirmPasswordCheck.isValid) {
      newErrors.confirmPassword = confirmPasswordCheck.errors;
    } else if (trimmedData.password !== trimmedData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!trimmedData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
    } else {
      const birthDate = new Date(trimmedData.dateOfBirth);
      const today = new Date();

      if (birthDate > today) {
        newErrors.dateOfBirth = "Ngày sinh không được trong tương lai";
      } else {
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        let actualAge = age;

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          actualAge--;
        }

        if (actualAge < 10) {
          newErrors.dateOfBirth = "Bạn phải trên 10 tuổi để đăng ký";
        }
      }
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;
    
    console.log("Kết quả validation:", { isValid, errors: newErrors });
    
    return isValid;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleGenderChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      gender: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    const payload = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      email: formData.email.trim(),
      dateOfBirth: formData.dateOfBirth.trim(),
      fullName: formData.fullName.trim(),
      gender: formData.gender.trim()
    };

    console.log("Dữ liệu gửi lên server:", payload);

    try {
      const API = "http://localhost:8081/api/auth/register";
      const response = await axios.post(API, payload);

      if (response.data?.status === "success") {
        setMessage(response.data.message || "Đăng ký thành công!");
        setToastVisible(true);

        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          dateOfBirth: "",
          gender: "",
        });
        setErrors({});
      }
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi đăng ký tài khoản.";

      if (error.response && error.response.data) {
        const serverError = error.response.data;
        errorMessage = serverError.message || errorMessage;

        if (serverError.field) {
          setErrors((prev) => ({
            ...prev,
            [serverError.field]: serverError.message,
          }));
        }
      } else if (error.request) {
        errorMessage = "Không kết nối được đến server. Vui lòng kiểm tra mạng.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setErrorMessage(errorMessage);
      setErrorToastVisible(true);
    } 
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
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

      <div className="max-w-290 w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-[40%] bg-linear-to-br from-indigo-700 via-blue-700 to-cyan-600 p-10 text-white flex flex-col justify-between items-center text-center">
          
          <div className="space-y-5">
            <img
              src={logo_iuh}
              alt="IUH Logo"
              className="h-20 brightness-0 invert mx-auto drop-shadow-lg"
            />
            <h1 className="text-lg font-semibold tracking-wide opacity-90">
              Industrial University of Ho Chi Minh City
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Hệ thống quản lý sự kiện
            </h2>
            <p className="text-blue-100 text-base leading-relaxed italic">
              "Nền tảng số hóa toàn bộ quy trình tổ chức sự kiện – từ đăng ký,
              check-in đến thống kê và báo cáo realtime."
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm tracking-widest font-medium">
              Đã có tài khoản?
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-base font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Đăng nhập ngay
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-[60%] p-10">  
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-700 mb-3">
              Tạo tài khoản mới
            </h2>
            <div className="h-1 w-20 bg-linear-to-r from-indigo-600 to-blue-600 rounded-full"></div>
          </div>

          <form className="space-y-8" onSubmit={handleRegister}>
            <FloatingInput
              id="fullName"
              label="Họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />

             <FloatingInput
              id="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <FloatingInput
              id="username"
              label="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FloatingInput
                id="password"
                label="Mật khẩu"
                isPassword
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <FloatingInput
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                isPassword
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">

              <div className="relative">
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="block w-full px-0 py-3 text-lg text-slate-700 bg-transparent border-0 border-b-2 border-slate-300 focus:outline-none focus:border-blue-600 transition-all duration-300"
                />
                <label className="absolute text-sm font-semibold tracking-wider text-slate-400 uppercase -translate-y-7 scale-90 top-3 left-0 origin-left pointer-events-none">
                  Ngày sinh
                </label>
                {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600 font-medium">{errors.dateOfBirth}</p>}
              </div>

              <div className="flex flex-col border-b-2 border-slate-200 pb-3">
                <label className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">
                  Giới tính
                </label>
                <div className="flex items-center space-x-8">
                  {["male", "female", "other"].map((gender) => (
                    <label key={gender} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleGenderChange}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-base text-slate-700 font-medium capitalize">
                        {gender === "male"
                          ? "Nam"
                          : gender === "female"
                          ? "Nữ"
                          : "Khác"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="w-full sm:w-72 py-4 bg-linear-to-r from-indigo-600 via-blue-600 to-sky-600 text-white text-base font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300 tracking-widest uppercase"
              >
                ĐĂNG KÝ NGAY
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;