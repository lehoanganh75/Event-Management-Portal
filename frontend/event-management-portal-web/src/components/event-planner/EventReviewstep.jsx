// EventReviewStep.jsx
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
  Gift,
  MessageSquare,
  FileText,
  Timer,
  UserCheck,
} from "lucide-react";

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

const InfoRow = ({ icon: Icon, label, value, color = "text-indigo-600" }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0">
    <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={15} />
    </div>

    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, color = "text-indigo-600", bg = "bg-indigo-50" }) => (
  <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} ${color}`}>
      <Icon size={17} />
    </div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
  </div>
);

const EmptyText = ({ children }) => (
  <p className="text-sm text-slate-500">{children}</p>
);

export const EventReviewStep = ({
  formData,
  isPlanMode = false,
  isReadOnly = false,
}) => {
  const { user } = useAuth();
  const role = user?.role || "";
  const isAuthority = role === "SUPER_ADMIN" || role === "ADMIN";

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
    targetObjects = [],
    coverImage,
    newOrg,
    orgSelectionMode,
    sessions = [],
    presenters = [],
    invitations = [],
  } = formData;

  const org =
    orgSelectionMode === "new" && newOrg
      ? {
        name: newOrg.name,
        email: newOrg.email,
        logo: newOrg.logoUrl,
      }
      : {
        name:
          formData.organization?.name ||
          formData.organizationName ||
          "Đơn vị đã chọn",
        email:
          formData.organization?.email ||
          formData.organizationEmail ||
          "Email liên hệ",
        logo:
          formData.organization?.logoUrl ||
          formData.organizationLogo ||
          null,
      };

  const STATUS_LABELS = {
    DRAFT: {
      label: "Bản nháp",
      color: "text-slate-600",
      bg: "bg-slate-50 border-slate-200",
    },
    PLAN_PENDING_APPROVAL: {
      label: "Chờ phê duyệt",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
    PLAN_APPROVED: {
      label: "Kế hoạch đã duyệt",
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
    },
    EVENT_PENDING_APPROVAL: {
      label: "Sự kiện chờ duyệt",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
    PUBLISHED: {
      label: "Đã công bố",
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    },
    ONGOING: {
      label: "Đang diễn ra",
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
    },
    COMPLETED: {
      label: "Đã kết thúc",
      color: "text-indigo-700",
      bg: "bg-indigo-50 border-indigo-200",
    },
    CANCELLED: {
      label: "Đã hủy",
      color: "text-rose-700",
      bg: "bg-rose-50 border-rose-200",
    },
    REJECTED: {
      label: "Từ chối",
      color: "text-rose-700",
      bg: "bg-rose-50 border-rose-200",
    },
  };

  const currentStatus = formData.status?.toUpperCase();

  const statusInfo =
    currentStatus && STATUS_LABELS[currentStatus]
      ? STATUS_LABELS[currentStatus]
      : {
        label: isAuthority ? "Công khai ngay" : "Chờ phê duyệt",
        color: isAuthority ? "text-emerald-700" : "text-amber-700",
        bg: isAuthority
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200",
      };

  const confirmedPresenters = (presenters || []).filter((p) => p.isConfirmed);
  const confirmedInvitations = (invitations || []).filter((i) => i.isConfirmed);

  return (
    <div className="w-full pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium">
                    {eventType || "Sự kiện"}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <h1 className="text-xl font-semibold text-slate-800 leading-snug">
                  {eventTitle || "Tên sự kiện chưa nhập"}
                </h1>
              </div>

              {coverImage && (
                <div className="w-full md:w-40 h-28 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Time */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <SectionHeader
              title="Thời gian & Địa điểm"
              icon={Calendar}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow icon={Calendar} label="Thời gian bắt đầu" value={formatDate(startTime)} />
              <InfoRow icon={Clock} label="Thời gian kết thúc" value={formatDate(endTime)} />
              <InfoRow icon={MapPin} label="Địa điểm tổ chức" value={location} color="text-rose-600" />
              <InfoRow icon={Timer} label="Hạn đăng ký" value={formatDate(registrationDeadline)} color="text-amber-600" />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <SectionHeader
              title="Mô tả & Mục tiêu"
              icon={FileText}
              color="text-blue-600"
              bg="bg-blue-50"
            />

            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-medium text-slate-500 mb-2">
                  Giới thiệu sự kiện
                </h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-700 leading-6">
                    {eventPurpose || "Chưa có mô tả chi tiết."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-2">
                    Mục tiêu
                  </h4>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 min-h-[90px]">
                    <p className="text-sm text-slate-700 leading-6">
                      {eventTopic || "Chưa cập nhật mục tiêu."}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-2">
                    Đối tượng tham gia
                  </h4>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 min-h-[90px] flex flex-wrap gap-2 content-start">
                    {targetObjects && targetObjects.length > 0 ? (
                      targetObjects.map((obj, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          {typeof obj === "string" ? obj : obj.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        Mọi đối tượng quan tâm
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <SectionHeader
              title="Chương trình chi tiết"
              icon={Clock}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />

            {sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((s, idx) => (
                  <div key={idx} className="">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {s.startTime
                          ? new Date(s.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "N/A"}
                        {" - "}
                        {s.endTime
                          ? new Date(s.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "N/A"}
                      </span>

                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        {s.type || "KEYNOTE"}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-800">
                      {s.title || "Nội dung chương trình"}
                    </h4>

                    {s.description && (
                      <p className="text-sm text-slate-600 mt-2 leading-6">
                        {s.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>Chưa thiết lập chương trình chi tiết.</EmptyText>
            )}
          </div>

          {/* Presenters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <SectionHeader
              title="Khách mời & Người trình bày"
              icon={Users}
              color="text-pink-600"
              bg="bg-pink-50"
            />

            {confirmedPresenters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confirmedPresenters.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center font-semibold shrink-0">
                        {p.fullName ? p.fullName.charAt(0).toUpperCase() : "?"}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {p.fullName || "Khách mời"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {p.email || "Không có email liên hệ"}
                        </p>
                      </div>
                    </div>

                    {p.targetSessionName && (
                      <span className="px-2 py-1 rounded-md bg-pink-50 text-pink-700 border border-pink-100 text-xs shrink-0 max-w-[120px] truncate" title={p.targetSessionName === "ALL" ? "Tất cả phiên" : p.targetSessionName}>
                        {p.targetSessionName === "ALL" ? "Tất cả phiên" : p.targetSessionName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>Chưa có khách mời hay người trình bày.</EmptyText>
            )}
          </div>

          {/* Members */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <SectionHeader
              title="Thành viên tổ chức & Thành viên mời"
              icon={UserCheck}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />

            {confirmedInvitations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confirmedInvitations.map((invite, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold shrink-0">
                        {invite.inviteeName
                          ? invite.inviteeName.charAt(0).toUpperCase()
                          : "M"}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {invite.inviteeName || "Chưa rõ tên"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {invite.inviteeEmail || "Không có email"}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs shrink-0">
                      {invite.targetRole || "MEMBER"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>Chưa mời thành viên ban tổ chức nào.</EmptyText>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h4 className="text-xs font-medium text-slate-500 mb-4">
              Đơn vị tổ chức
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building size={20} className="text-slate-400" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {org.name}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {org.email}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded-xl p-5 ${isAuthority
              ? "bg-emerald-50 border-emerald-200"
              : isPlanMode
                ? "bg-blue-50 border-blue-200"
                : "bg-amber-50 border-amber-200"
              }`}
          >
            <div
              className={`flex items-center gap-2 text-sm font-medium ${isAuthority
                ? "text-emerald-800"
                : isPlanMode
                  ? "text-blue-800"
                  : "text-amber-800"
                }`}
            >
              {currentStatus === "PLAN_APPROVED" ? (
                <CheckCircle size={17} />
              ) : (
                <Info size={17} />
              )}

              {currentStatus === "PLAN_APPROVED"
                ? "Kế hoạch đã được duyệt"
                : isAuthority
                  ? "Tự động phê duyệt"
                  : isPlanMode
                    ? "Kế hoạch đang tạo nháp"
                    : "Gửi kiểm duyệt sự kiện"}
            </div>

            <p
              className={`text-sm leading-6 mt-2 ${isAuthority
                ? "text-emerald-700"
                : isPlanMode
                  ? "text-blue-700"
                  : "text-amber-700"
                }`}
            >
              {currentStatus === "PLAN_APPROVED"
                ? "Kế hoạch này đã được phê duyệt và có thể triển khai thành sự kiện chính thức."
                : isAuthority
                  ? "Với quyền quản trị, nội dung này có thể được phê duyệt và công bố nhanh."
                  : isPlanMode
                    ? "Bạn có thể lưu nháp hoặc gửi kế hoạch lên cấp quản trị để phê duyệt."
                    : "Sự kiện sau khi tạo sẽ chờ quản trị viên duyệt trước khi công khai."}
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <h4 className="text-xs font-medium text-slate-400 mb-4">
              Tóm tắt quy mô
            </h4>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Người tham gia</span>
                <span className="font-medium text-indigo-300">
                  {maxParticipants || 0}
                </span>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Phiên hoạt động</span>
                <span className="font-medium text-emerald-300">
                  {sessions?.length || 0}
                </span>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Người trình bày</span>
                <span className="font-medium text-pink-300">
                  {confirmedPresenters.length}
                </span>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Thành viên tổ chức</span>
                <span className="font-medium text-teal-300">
                  {confirmedInvitations.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventReviewStep;