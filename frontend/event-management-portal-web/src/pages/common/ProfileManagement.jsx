import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Calendar, Shield, LogOut, Edit2, Key,
  Loader2, CheckCircle2, Camera, Mail, BadgeCheck,
  Save, X, Lock, Eye, EyeOff, CheckCircle, AlertCircle,
  FileText, UserCircle
} from "lucide-react";

// IMPORT AUTH CONTEXT
import { useAuth } from "../../context/AuthContext";

const roleMap = {
  SUPER_ADMIN: "Quản trị viên cấp cao",
  ADMIN: "Quản trị viên",
  LECTURER: "Giảng viên / Tổ chức",
  STUDENT: "Sinh viên",
  GUEST: "Khách",
};

const roleColors = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  LECTURER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  STUDENT: "bg-indigo-100 text-indigo-700 border-indigo-200",
  GUEST: "bg-slate-100 text-slate-600 border-slate-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusMap = {
  ACTIVE: "Đang hoạt động",
  DISABLED: "Đã khóa",
  INACTIVE: "Chưa kích hoạt",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const ProfileManagement = () => {
  const navigate = useNavigate();

  // 2. LẤY DỮ LIỆU VÀ PHƯƠNG THỨC TỪ AUTH CONTEXT
  const { user, logout, loadUser, identity, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    fullName: "", dateOfBirth: "", gender: "", bio: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "", newPassword: "", confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // 3. ĐỒNG BỘ FORM DATA KHI USER TRONG CONTEXT THAY ĐỔI
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // 4. LƯU THÔNG TIN CÁ NHÂN
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await identity.updateMyProfile(formData);
      await loadUser();
      setIsEditing(false);
      showToast("Cập nhật hồ sơ thành công!");
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi cập nhật", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Kích thước ảnh không được vượt quá 5MB", "error");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await identity.uploadFile(file);
      const avatarUrl = res.data.url;
      if (!avatarUrl) {
        throw new Error("Không nhận được URL từ máy chủ");
      }
      await identity.updateMyProfile({ ...formData, avatarUrl });
      await loadUser();
      showToast("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Lỗi khi tải ảnh lên", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const validatePassword = (pw) => {
    const errs = [];
    if (pw.length < 8) errs.push("Ít nhất 8 ký tự");
    if (!/[A-Z]/.test(pw)) errs.push("Ít nhất 1 chữ hoa");
    if (!/[a-z]/.test(pw)) errs.push("Ít nhất 1 chữ thường");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw)) errs.push("Ít nhất 1 ký tự đặc biệt");
    return errs;
  };

  // 5. ĐỔI MẬT KHẨU
  const handleChangePassword = async () => {
    const errs = {};
    if (!passwordForm.oldPassword) errs.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    const newPwErrs = validatePassword(passwordForm.newPassword);
    if (!passwordForm.newPassword) errs.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (newPwErrs.length > 0) errs.newPassword = newPwErrs;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = "Mật khẩu xác nhận không khớp";

    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }

    setIsChangingPassword(true);
    try {
      await identity.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Đổi mật khẩu thành công!");
    } catch (err) {
      showToast(err.response?.data?.message || "Mật khẩu hiện tại không đúng", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const pwStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = (s) => {
    if (s <= 1) return { label: "Yếu", color: "bg-red-400", text: "text-red-500" };
    if (s <= 3) return { label: "Trung bình", color: "bg-orange-400", text: "text-orange-500" };
    return { label: "Mạnh", color: "bg-emerald-400", text: "text-emerald-500" };
  };

  if (authLoading || !user) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#1a3a6b]" />
    </div>
  );

  const strength = pwStrength(passwordForm.newPassword);
  const { label: sLabel, color: sColor, text: sText } = strengthLabel(strength);

  return (
    <div className="font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-28 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl shadow-2xl border transition-all ${toast.type === "success" ? "border-emerald-100" : "border-red-100"}`}>
          {toast.type === "success" ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
          <p className={`text-sm font-bold ${toast.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{toast.message}</p>
        </div>
      )}

      <div className="h-64 bg-[#1a3a6b] relative overflow-hidden rounded-[2rem] mb-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 pb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Trái */}
          <div className="lg:w-[300px] shrink-0">
            <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-slate-100">
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                  {isUploadingAvatar ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#1a3a6b]" />
                    </div>
                  ) : (
                    <img
                      src={user.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-[#1a3a6b] text-white rounded-full shadow-lg cursor-pointer hover:bg-[#15306b] transition-all">
                  <Camera size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                </label>
              </div>

              <h2 className="text-lg font-black text-slate-800 tracking-tight mb-1">{user.fullName || "Người dùng"}</h2>
              <p className="text-xs text-slate-400 mb-4 truncate">{user.email}</p>

              <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${roleColors[user.role] || roleColors.default}`}>
                  {roleMap[user.role] || user.role}
                </span>
              </div>

              <div className="space-y-1.5">
                <SidebarBtn active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={<User size={16} />} label="Thông tin cá nhân" />
                <SidebarBtn active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Key size={16} />} label="Bảo mật" />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 min-h-[520px]">
              {activeTab === "info" ? (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-7 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Hồ sơ chi tiết</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Quản lý thông tin cá nhân của bạn</p>
                    </div>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm hover:bg-[#15306b] transition-all cursor-pointer shadow-md shadow-[#1a3a6b]/20">
                        <Edit2 size={14} /> Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm hover:bg-[#15306b] disabled:opacity-50 transition-all cursor-pointer">
                          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu
                        </button>
                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer">
                          <X size={14} /> Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoBox label="Địa chỉ Email" value={user.email} icon={Mail} highlight />
                    <InfoBox label="Trạng thái tài khoản" value={statusMap[user.status] || "Đang hoạt động"} icon={BadgeCheck} />
                    <EditableInput label="Họ và tên" value={formData.fullName} isEditing={isEditing} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} icon={User} />
                    <EditableSelect label="Giới tính" value={formData.gender} isEditing={isEditing} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} icon={UserCircle} options={[{ v: "MALE", l: "Nam" }, { v: "FEMALE", l: "Nữ" }, { v: "OTHER", l: "Khác" }]} />
                    <EditableInput label="Ngày sinh" type="date" value={formData.dateOfBirth} isEditing={isEditing} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} icon={Calendar} />
                    <div className="md:col-span-2">
                      <EditableTextArea label="Tiểu sử (Bio)" value={formData.bio} isEditing={isEditing} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} icon={FileText} placeholder="Giới thiệu ngắn về bản thân bạn..." />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-4 duration-500">
                  <div className="mb-7 pb-4 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800">Đổi mật khẩu</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Bảo vệ tài khoản bằng mật khẩu mạnh</p>
                  </div>

                  <div className="max-w-md space-y-5">
                    <PasswordField label="Mật khẩu hiện tại" value={passwordForm.oldPassword} show={showOld} onToggle={() => setShowOld(!showOld)} onChange={(e) => { setPasswordForm({ ...passwordForm, oldPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, oldPassword: "" }); }} error={passwordErrors.oldPassword} placeholder="Nhập mật khẩu hiện tại" />
                    <div className="space-y-1.5">
                      <PasswordField label="Mật khẩu mới" value={passwordForm.newPassword} show={showNew} onToggle={() => setShowNew(!showNew)} onChange={(e) => { setPasswordForm({ ...passwordForm, newPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, newPassword: "" }); }} error={passwordErrors.newPassword} placeholder="Nhập mật khẩu mới" />
                      {passwordForm.newPassword && (
                        <div className="space-y-1.5 mt-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? sColor : "bg-slate-200"}`} />
                            ))}
                          </div>
                          <p className={`text-xs font-semibold ${sText}`}>Độ mạnh: {sLabel}</p>
                        </div>
                      )}
                    </div>
                    <PasswordField label="Xác nhận mật khẩu" value={passwordForm.confirmPassword} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} onChange={(e) => { setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, confirmPassword: "" }); }} error={passwordErrors.confirmPassword} placeholder="Nhập lại mật khẩu mới" />
                    <button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl font-semibold text-sm hover:bg-[#15306b] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer">
                      {isChangingPassword ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : <><Lock size={16} /> Đổi mật khẩu</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CÁC SUB-COMPONENT ---

const SidebarBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${active ? "bg-[#1a3a6b] text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"}`}>
    {icon} {label}
  </button>
);

const InfoBox = ({ label, value, icon: Icon, highlight = false }) => (
  <div className={`p-4 rounded-2xl border ${highlight ? "bg-blue-50/50 border-blue-100" : "bg-slate-50/70 border-slate-100"}`}>
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`p-1.5 rounded-lg ${highlight ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm"}`}>
        <Icon size={15} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-sm font-semibold truncate ${highlight ? "text-blue-700" : "text-slate-800"}`}>{value || "Chưa cập nhật"}</p>
  </div>
);

const EditableInput = ({ label, value, isEditing, onChange, icon: Icon, type = "text" }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-200 ${isEditing ? "bg-white border-[#1a3a6b]/30 ring-2 ring-[#1a3a6b]/10" : "bg-slate-50/70 border-slate-100"}`}>
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`p-1.5 rounded-lg ${isEditing ? "bg-[#1a3a6b] text-white" : "bg-white text-slate-400 shadow-sm"}`}>
        <Icon size={15} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    {isEditing ? (
      <input type={type} value={value || ""} onChange={onChange} className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none border-b border-[#1a3a6b]/20 focus:border-[#1a3a6b] transition-colors py-0.5" />
    ) : (
      <p className="text-sm font-semibold text-slate-800">{type === "date" ? formatDate(value) : (value || "Chưa cập nhật")}</p>
    )}
  </div>
);

const EditableTextArea = ({ label, value, isEditing, onChange, icon: Icon, placeholder }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-200 ${isEditing ? "bg-white border-[#1a3a6b]/30 ring-2 ring-[#1a3a6b]/10" : "bg-slate-50/70 border-slate-100"}`}>
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`p-1.5 rounded-lg ${isEditing ? "bg-[#1a3a6b] text-white" : "bg-white text-slate-400 shadow-sm"}`}>
        <Icon size={15} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    {isEditing ? (
      <textarea
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none border-b border-[#1a3a6b]/20 focus:border-[#1a3a6b] transition-colors py-1 resize-none"
      />
    ) : (
      <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{value || "Chưa cập nhật"}</p>
    )}
  </div>
);

const EditableSelect = ({ label, value, isEditing, onChange, icon: Icon, options }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-200 ${isEditing ? "bg-white border-[#1a3a6b]/30 ring-2 ring-[#1a3a6b]/10" : "bg-slate-50/70 border-slate-100"}`}>
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`p-1.5 rounded-lg ${isEditing ? "bg-[#1a3a6b] text-white" : "bg-white text-slate-400 shadow-sm"}`}>
        <Icon size={15} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    {isEditing ? (
      <select value={value || ""} onChange={onChange} className="w-full text-sm font-semibold text-slate-800 bg-transparent outline-none border-b border-[#1a3a6b]/20 focus:border-[#1a3a6b] cursor-pointer">
        {options.map((opt) => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
      </select>
    ) : (
      <p className="text-sm font-semibold text-slate-800">{options.find((o) => o.v === value)?.l || "Chưa cập nhật"}</p>
    )}
  </div>
);

const PasswordField = ({ label, value, show, onToggle, onChange, error, placeholder }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm outline-none transition-all ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1a3a6b]"
          }`}
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{Array.isArray(error) ? error[0] : error}</p>}
  </div>
);

export default ProfileManagement;
