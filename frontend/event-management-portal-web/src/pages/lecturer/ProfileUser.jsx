import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Camera, Briefcase, Calendar, CheckCircle, Edit2, Save, X, Phone, UserCircle, MapPin, Loader2 } from "lucide-react";
import authService from "../../services/authService";
import eventService from "../../services/eventService";
import { toast } from "react-toastify";

const ProfileUser = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchOrganizations();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getMyProfile();
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await eventService.getAllOrganizations();
      setOrganizations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Tìm tên tổ chức dựa trên ID để cập nhật cả ID và Name
      const selectedOrg = organizations.find(o => o.id === formData.organizationId);
      const updatePayload = {
        ...formData,
        organizationName: selectedOrg ? selectedOrg.name : formData.organizationName
      };

      await authService.updateMyProfile(updatePayload);
      toast.success("✅ Cập nhật hồ sơ thành công!");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-5xl mx-auto p-6"
    >
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8 relative">
        <div className="h-32 bg-gradient-to-r from-slate-800 to-indigo-900" />
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 mb-4 text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-xl border border-white/50 backdrop-blur-sm">
                <img 
                  src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || "User")}&background=0284c7&color=fff&size=200`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-2xl" 
                />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 group-hover:rotate-6">
                <Camera size={18}/>
              </button>
            </div>
            
            <div className="pb-2 flex-1 w-full">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 justify-between">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile?.fullName}</h2>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full flex items-center gap-1.5 border border-emerald-100 uppercase tracking-wider">
                      <CheckCircle size={12} /> Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-slate-500 text-sm font-medium">
                    <span className="flex items-center gap-1.5"><Shield size={14} className="text-indigo-500"/> {profile?.loginCode || "Chưa cập nhật mã số"}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-rose-500"/> {profile?.organizationName || "Chưa có đơn vị"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <button 
                        onClick={() => { setEditMode(false); setFormData(profile); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                      >
                        <X size={18} /> HỦY
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        LƯU THAY ĐỔI
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-100 text-slate-800 rounded-xl font-black text-sm hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
                    >
                      <Edit2 size={18} /> CHỈNH SỬA HỒ SƠ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Thông tin chi tiết */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 opacity-50" />
            
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 relative z-10">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><UserCircle size={18} /></span> 
              Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
              <EditItem 
                label="Họ và tên" 
                name="fullName"
                value={formData.fullName} 
                isEditing={editMode}
                onChange={(v) => setFormData({...formData, fullName: v})}
                icon={<User size={18}/>} 
              />
              <EditItem 
                label="Mã số nhân viên/SV" 
                name="loginCode"
                value={formData.loginCode} 
                isEditing={editMode}
                placeholder="VD: 20123456"
                onChange={(v) => setFormData({...formData, loginCode: v})}
                icon={<Shield size={18}/>} 
              />
              <EditItem 
                label="Email liên hệ" 
                value={profile?.email} 
                isEditing={false} // Email thường không tự đổi được từ profile profile
                icon={<Mail size={18}/>} 
              />
              <EditItem 
                label="Số điện thoại" 
                name="phone"
                value={formData.phone} 
                isEditing={editMode}
                placeholder="Chưa cập nhật"
                onChange={(v) => setFormData({...formData, phone: v})}
                icon={<Phone size={18}/>} 
              />
              <div className="sm:col-span-2">
                <EditItem 
                  label="Đơn vị / Khoa" 
                  name="organizationId"
                  type="select"
                  options={organizations.map(o => ({ value: o.id, label: o.name }))}
                  value={formData.organizationId} 
                  isEditing={editMode}
                  displayValue={profile?.organizationName}
                  onChange={(v) => setFormData({...formData, organizationId: v})}
                  icon={<Briefcase size={18}/>} 
                />
              </div>
              <EditItem 
                label="Chức vụ" 
                name="position"
                value={formData.position} 
                isEditing={editMode}
                placeholder="VD: Giảng viên, Sinh viên..."
                onChange={(v) => setFormData({...formData, position: v})}
                icon={<Briefcase size={18}/>} 
              />
               <EditItem 
                label="Giới tính" 
                name="gender"
                type="select"
                options={[{value: "MALE", label: "Nam"}, {value: "FEMALE", label: "Nữ"}, {value: "OTHER", label: "Khác"}]}
                value={formData.gender} 
                isEditing={editMode}
                displayValue={profile?.gender === "MALE" ? "Nam" : profile?.gender === "FEMALE" ? "Nữ" : "Khác"}
                onChange={(v) => setFormData({...formData, gender: v})}
                icon={<User size={18}/>} 
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Bảo mật & Thống kê */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"><Shield size={18} /></span> 
              Bảo mật tài khoản
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Hai lớp (2FA)</p>
                  <p className="text-sm font-medium">Bảo mật nâng cao</p>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">ACTIVE</span>
              </div>

              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-black hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg">
                ĐỔI MẬT KHẨU
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Hoạt động</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 font-medium italic">Tham gia hệ thống</span>
                  <span className="text-sm font-bold text-slate-800">{new Date(profile?.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component con để tái sử dụng với khả năng Edit
const EditItem = ({ label, value, icon, isEditing, onChange, placeholder, type = "text", options = [], displayValue }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 p-2.5 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      
      {isEditing ? (
        type === "select" ? (
          <select 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">-- Chọn {label} --</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input 
            type={type}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none"
            value={value || ""}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <p className="font-bold text-slate-700 text-base">
          {displayValue || value || <span className="text-slate-300 font-normal italic">Chưa cập nhật</span>}
        </p>
      )}
    </div>
  </div>
);

export default ProfileUser;