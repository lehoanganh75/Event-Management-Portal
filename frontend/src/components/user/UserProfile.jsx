import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Calendar, Shield, LogOut, Edit2, Key,
  AlertCircle, Loader2, CheckCircle2, Camera, Mail, BadgeCheck, Save, X
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
  const [accountInfo, setAccountInfo] = useState({ email: "", roles: [], accountId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  // State cho chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) { navigate("/login"); return; }

      try {
        const decoded = jwtDecode(token);
        setAccountInfo({
          email: decoded.email,
          roles: decoded.role || [],
          accountId: decoded.accountId // Lấy accountId từ JWT để dùng cho hàm update
        });

        const response = await axios.get("http://localhost:8082/api/profiles/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
        setFormData(response.data); // Copy dữ liệu vào form
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login?sessionExpired=true");
        } else {
          setError(err.response?.data?.message || "Không thể tải hồ sơ");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Hàm xử lý lưu thông tin
  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
    setIsSaving(true);
    try {
      // Gọi đúng hàm updateProfile(accountId, updatedProfile) từ Backend
      const response = await axios.put(
        `http://localhost:8082/api/profiles/${accountInfo.accountId}`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfile(response.data);
      setIsEditing(false);
      // Bạn có thể thêm toast thông báo thành công ở đây
    } catch (err) {
      alert("Lỗi khi cập nhật: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

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
                <label className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-all">
                  <Camera size={14} />
                  <input type="file" className="hidden" />
                </label>
              </div>

              <h2 className="text-xl font-black text-slate-800">{profile?.fullName}</h2>
              
              <div className="flex flex-wrap justify-center gap-2 mt-3 mb-6">
                {accountInfo.roles.map((role, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-100">
                    {roleMap[role] || role}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <SidebarBtn active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={<User size={18}/>} label="Thông tin hồ sơ" />
                <SidebarBtn active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Key size={18}/>} label="Bảo mật" />
                <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-4">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 min-h-[500px]">
              {activeTab === "info" ? (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-800">Thông tin chi tiết</h3>
                    
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
                      >
                        <Edit2 size={14} /> Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />} Lưu
                        </button>
                        <button 
                          onClick={() => { setIsEditing(false); setFormData(profile); }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200"
                        >
                          <X size={14} /> Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoBox label="Địa chỉ Email" value={accountInfo.email} icon={Mail} highlight />
                    
                    {/* Các trường có thể chỉnh sửa */}
                    <EditableInput 
                      label="Họ và tên" 
                      value={formData.fullName} 
                      isEditing={isEditing}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      icon={User}
                    />

                    <EditableSelect 
                      label="Giới tính" 
                      value={formData.gender} 
                      isEditing={isEditing}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      icon={User}
                      options={[{v: "Male", l: "Nam"}, {v: "Female", l: "Nữ"}, {v: "Other", l: "Khác"}]}
                    />

                    <EditableInput 
                      label="Ngày sinh" 
                      type="date"
                      value={formData.dateOfBirth} 
                      isEditing={isEditing}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      icon={Calendar}
                    />

                    <EditableInput 
                      label="Ngành học" 
                      value={formData.majorName} 
                      isEditing={isEditing}
                      onChange={(e) => setFormData({...formData, majorName: e.target.value})}
                      icon={Shield}
                    />

                    {/* Các trường chỉ đọc */}
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

// --- SUB-COMPONENTS ---

const SidebarBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"}`}>
    {icon} {label}
  </button>
);

const InfoBox = ({ label, value, icon: Icon, highlight = false }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-300 ${highlight ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-50"}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={highlight ? "text-blue-600" : "text-slate-400"} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
    <p className={`text-sm font-bold truncate pl-6 ${highlight ? "text-blue-700" : "text-slate-700"}`}>{value || "N/A"}</p>
  </div>
);

const EditableInput = ({ label, value, isEditing, onChange, icon: Icon, type = "text" }) => (
  <div className={`p-4 rounded-2xl border transition-all ${isEditing ? "bg-white border-blue-500 ring-2 ring-blue-50" : "bg-slate-50 border-slate-50"}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={isEditing ? "text-blue-600" : "text-slate-400"} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
    {isEditing ? (
      <input 
        type={type} 
        value={value || ""} 
        onChange={onChange}
        className="w-full text-sm font-bold text-slate-700 pl-6 outline-none bg-transparent"
      />
    ) : (
      <p className="text-sm font-bold text-slate-700 pl-6">{type === "date" ? formatDate(value) : (value || "Chưa cập nhật")}</p>
    )}
  </div>
);

const EditableSelect = ({ label, value, isEditing, onChange, icon: Icon, options }) => (
  <div className={`p-4 rounded-2xl border transition-all ${isEditing ? "bg-white border-blue-500 ring-2 ring-blue-50" : "bg-slate-50 border-slate-50"}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={isEditing ? "text-blue-600" : "text-slate-400"} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
    {isEditing ? (
      <select value={value || ""} onChange={onChange} className="w-full text-sm font-bold text-slate-700 pl-6 outline-none bg-transparent">
        {options.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
      </select>
    ) : (
      <p className="text-sm font-bold text-slate-700 pl-6">{options.find(o => o.v === value)?.l || "Chưa cập nhật"}</p>
    )}
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default UserProfile;