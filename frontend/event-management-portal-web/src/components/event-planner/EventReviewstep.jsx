import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Clock,
  Info,
  CheckCircle,
  Building,
  ArrowLeft,
  Gift,
  MessageSquare,
  ChevronRight,
  Sparkles,
  FileText,
  UserCheck,
  Tag,
  Loader2,
  Mail,
  HelpCircle,
  BarChart2,
  Timer,
  Layout,
  ExternalLink
} from "lucide-react";

const fi = "'Inter','Segoe UI',sans-serif";

const formatDate = (val) => {
  if (!val) return "Chưa chọn";
  const d = new Date(val);
  if (isNaN(d)) return "Lỗi ngày tháng";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoRow = ({ icon: Icon, label, value, color = "#64748b" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
    <div style={{ color: color, display: "flex", alignItems: "center" }}>
      <Icon size={16} />
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{label}:</span>
      <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{value || "N/A"}</span>
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
      <Icon size={16} />
    </div>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>{title}</h3>
  </div>
);

export const EventReviewStep = ({ formData, onBack, onSubmit, isSubmitting }) => {
  const { user } = useAuth();
  const role = user?.role || "";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const {
    eventTitle,
    eventType,
    startTime,
    endTime,
    registrationDeadline,
    location,
    eventPurpose,
    eventTopic,
    maxParticipants,
    targetObjects,
    coverImage,
    newOrg,
    orgSelectionMode,
    prizes = [],
    hasLuckyDraw = false,
    interactions = [],
  } = formData;

  const org = orgSelectionMode === 'new' && newOrg 
    ? { name: newOrg.name, email: newOrg.email, logo: newOrg.logoUrl }
    : { name: formData.organizationName || "Đơn vị đã chọn", email: formData.organizationEmail || "Email liên hệ", logo: null };

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "20px 0", fontFamily: fi }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Basic Info Card */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span style={{ padding: "4px 10px", background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, borderRadius: 6, textTransform: "uppercase" }}>
                      {eventType || "Sự kiện"}
                    </span>
                    <span style={{ padding: "4px 10px", background: isSuperAdmin ? "#f0fdf4" : "#fffbeb", color: isSuperAdmin ? "#16a34a" : "#b45309", fontSize: 11, fontWeight: 700, borderRadius: 6 }}>
                      {isSuperAdmin ? "CÔNG KHAI NGAY" : "CHỜ PHÊ DUYỆT"}
                    </span>
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 16px" }}>{eventTitle || "Tên sự kiện chưa nhập"}</h1>
                </div>
                {coverImage && (
                  <div style={{ width: 120, height: 80, borderRadius: 12, overflow: "hidden", border: "1px solid #f1f5f9", marginLeft: 20 }}>
                    <img src={coverImage} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <InfoRow icon={Calendar} label="Bắt đầu" value={formatDate(startTime)} color="#6366f1" />
                  <InfoRow icon={Clock} label="Kết thúc" value={formatDate(endTime)} color="#6366f1" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <InfoRow icon={MapPin} label="Địa điểm" value={location} color="#ef4444" />
                  <InfoRow icon={Timer} label="Hạn đăng ký" value={formatDate(registrationDeadline)} color="#f59e0b" />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "32px" }}>
              <SectionHeader title="Mô tả & Mục tiêu" icon={FileText} />
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.05em" }}>Giới thiệu sự kiện</h4>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{eventPurpose || "Chưa có mô tả."}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.05em" }}>Mục tiêu</h4>
                    <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>{eventTopic || "Nâng cao kỹ năng sinh viên."}</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.05em" }}>Người tham gia</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {targetObjects && targetObjects.length > 0 ? (
                        targetObjects.map((obj, i) => (
                          <span key={i} style={{ padding: "4px 8px", background: "#f8fafc", border: "1px solid #f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 600, borderRadius: 6 }}>
                            {typeof obj === 'string' ? obj : obj.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>Mọi sinh viên</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules Card */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px" }}>
                <SectionHeader title="Giải thưởng" icon={Gift} />
                {hasLuckyDraw && prizes.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {prizes.map((p, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fdfaff", borderRadius: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#6b21a8" }}>{p.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#a855f7" }}>x{p.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Không kích hoạt</p>
                )}
              </div>
              <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px" }}>
                <SectionHeader title="Tương tác" icon={MessageSquare} />
                {interactions.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: "12px", background: "#f0f9ff", borderRadius: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0369a1" }}>{interactions.filter(i => i.type === 'question').length}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#0ea5e9", textTransform: "uppercase" }}>Câu hỏi</div>
                    </div>
                    <div style={{ padding: "12px", background: "#fdf4ff", borderRadius: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#86198f" }}>{interactions.filter(i => i.type === 'poll').length}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#d946ef", textTransform: "uppercase" }}>Bình chọn</div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Không kích hoạt</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Organization Info */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px" }}>
               <h4 style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 20, letterSpacing: "0.05em" }}>Ban tổ chức</h4>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {org.logo ? <img src={org.logo} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%" }} /> : <Building size={20} className="text-slate-300" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{org.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{org.email}</div>
                  </div>
               </div>
            </div>

            {/* Status Card */}
            <div style={{ background: isSuperAdmin ? "#f0fdf4" : "#fffbeb", border: "1px solid", borderColor: isSuperAdmin ? "#bbf7d0" : "#fef3c7", borderRadius: 16, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ color: isSuperAdmin ? "#16a34a" : "#b45309" }}>
                  <Info size={18} />
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: isSuperAdmin ? "#166534" : "#92400e", margin: 0 }}>{isSuperAdmin ? "Xuất bản trực tiếp" : "Chờ phê duyệt"}</h4>
              </div>
              <p style={{ fontSize: 13, color: isSuperAdmin ? "#15803d" : "#92400e", lineHeight: 1.5, margin: 0 }}>
                {isSuperAdmin 
                  ? "Với quyền Super Admin, hệ thống sẽ công khai sự kiện ngay sau khi bạn xác nhận."
                  : "Sự kiện sẽ được gửi đến Admin để kiểm tra và phê duyệt nội dung."}
              </p>
            </div>

            {/* Quick Stats Sidebar */}
            <div style={{ background: "#1e1b4b", borderRadius: 16, padding: "24px", color: "#fff" }}>
               <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 20 }}>Tóm tắt quy mô</div>
               <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Users size={16} />
                      <span style={{ fontSize: 13 }}>Người tham gia</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{maxParticipants || 0}</span>
                  </div>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Award size={16} />
                      <span style={{ fontSize: 13 }}>Giải thưởng</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{prizes.length}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ 
          background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12
        }}>
          <button 
            onClick={onBack} 
            disabled={isSubmitting}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", 
              background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" 
            }}
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
          
          <button 
            onClick={() => onSubmit(formData)} 
            disabled={isSubmitting}
            style={{ 
              display: "flex", alignItems: "center", gap: 10, padding: "12px 32px", borderRadius: 10, border: "none", 
              background: "#1e1b4b", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(30, 27, 75, 0.2)"
            }}
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
            ) : (
              <>{isSuperAdmin ? "Xuất bản ngay" : "Gửi phê duyệt"} <CheckCircle size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventReviewStep;
