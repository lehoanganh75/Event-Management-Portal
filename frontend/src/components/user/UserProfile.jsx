import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Calendar, Shield, LogOut, Edit2, Key,
  AlertCircle, Loader2, CheckCircle2, Camera, Mail, BadgeCheck
} from "lucide-react";
import { jwtDecode } from 'jwt-decode';

const roleMap = {
  SUPER_ADMIN: "Quản Trị Viên",
  ADMIN: "Quản trị hệ thống",
  LECTURER: "Giảng viên",
  STUDENT: "Sinh viên",
  GUEST: "Khách",
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [accountInfo, setAccountInfo] = useState({ email: "", roles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setAccountInfo({
          email: decoded.email,
          roles: decoded.role || [] 
        });

        const response = await axios.get("http://localhost:8082/api/profiles/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (err) {
        console.error("Lỗi:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login?sessionExpired=true");
        } else {
          setError(err.response?.data?.message || "Không thể tải thông tin hồ sơ");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm border border-red-50">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-800 font-bold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 font-bold hover:underline">Thử lại</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="h-48 bg-linear-to-r from-blue-700 to-indigo-600 w-full" />
      
      <div className="max-w-5xl mx-auto px-4 -mt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-slate-100">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <img
                  src={profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                />
                <label className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
                  <Camera size={14} />
                  <input type="file" className="hidden" />
                </label>
              </div>

              <h2 className="text-xl font-black text-slate-800">{profile?.fullName}</h2>
              
              {/* Hiển thị Roles từ JWT */}
              <div className="flex flex-wrap justify-center gap-2 mt-3 mb-6">
                {accountInfo.roles.map((role, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-100">
                    {roleMap[role] || role}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <button onClick={() => setActiveTab("info")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "info" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"}`}>
                  <User size={18} /> Thông tin hồ sơ
                </button>
                <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "security" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"}`}>
                  <Key size={18} /> Bảo mật
                </button>
                <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-4">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 min-h-125">
              {activeTab === "info" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-800">Thông tin chi tiết</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
                      <Edit2 size={14} /> Chỉnh sửa
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Thông tin từ JWT */}
                    <InfoBox label="Địa chỉ Email" value={accountInfo.email} icon={Mail} highlight />
                    
                    {/* Thông tin từ API Profile */}
                    <InfoBox label="Họ và tên" value={profile?.fullName} icon={User} />
                    <InfoBox label="Giới tính" value={profile?.gender === "Male" ? "Nam" : profile?.gender === "Female" ? "Nữ" : "Khác"} icon={User} />
                    <InfoBox label="Ngày sinh" value={formatDate(profile?.dateOfBirth)} icon={Calendar} />
                    <InfoBox label="Ngành học" value={profile?.majorName} icon={Shield} />
                    <InfoBox label="Trạng thái hồ sơ" value={profile?.approvalStatus} icon={BadgeCheck} />
                    <InfoBox label="Ngày tham gia" value={formatDate(profile?.createdAt)} icon={Calendar} />
                    <InfoBox label="ID định danh" value={profile?.id} icon={CheckCircle2} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <Key className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Tính năng bảo mật đang cập nhật</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, icon: Icon, highlight = false }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-300 group ${highlight ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md"}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={highlight ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
    <p className={`text-sm font-bold truncate pl-6 ${highlight ? "text-blue-700" : "text-slate-700"}`}>
      {value || "Chưa cập nhật"}
    </p>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default UserProfile;