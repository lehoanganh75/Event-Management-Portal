import React from "react";
import {
  Settings,
  Edit3,
  Trash2,
  ShieldCheck,
  Mail,
  Bot,
  Trash,
  Gift,
  ChevronRight,
  LogOut
} from "lucide-react";

const SettingsTab = ({
  event,
  isAdmin,
  isMember,
  userPerms = {},
  onEdit,
  onNavigateToLuckyDraw,
  setShowDeleteConfirm,
  onResetStatistics,
  onLeaveTeam
}) => {
  // Nếu là Member (không phải Admin hay Leader/Coordinator)
  // Trong context này, isMember có nghĩa là role === 'MEMBER'
  const isOnlyMember = isMember && !isAdmin && userPerms.organizerRole === 'MEMBER';

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur">
              <Settings size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Cài đặt sự kiện
              </h2>

              <p className="text-sm text-slate-300 mt-1">
                {isOnlyMember ? "Quản lý vai trò của bạn trong sự kiện" : "Quản lý cấu hình, dữ liệu và quyền của sự kiện"}
              </p>
            </div>
          </div>
        </div>

        {!isOnlyMember && (
          <>
            {/* SECTION 1 */}
            <SectionTitle
              icon={<Settings size={16} />}
              title="Cấu hình cơ bản"
            />

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {(isAdmin || userPerms.canEditEvent) && (
                <SettingItem
                  icon={
                    <div className="bg-indigo-50 text-indigo-600">
                      <Edit3 size={18} />
                    </div>
                  }
                  title="Chỉnh sửa thông tin sự kiện"
                  description="Cập nhật tên, thời gian, mô tả và địa điểm."
                  onClick={onEdit}
                />
              )}

              <SettingItem
                icon={
                  <div className="bg-sky-50 text-sky-600">
                    <ShieldCheck size={18} />
                  </div>
                }
                title="Cài đặt quyền riêng tư"
                description="Quản lý quyền truy cập và tham gia sự kiện."
              />
            </div>

            {/* SECTION 2 */}
            <SectionTitle
              icon={<ShieldCheck size={16} />}
              title="Hệ thống & dữ liệu"
            />

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

              <SettingItem
                icon={
                  <div className="bg-amber-50 text-amber-600">
                    <Gift size={18} />
                  </div>
                }
                title={
                  event?.hasLuckyDraw
                    ? "Quản lý vòng quay may mắn"
                    : "Khởi tạo vòng quay may mắn"
                }
                description="Thiết lập quà tặng và chương trình quay thưởng."
                onClick={onNavigateToLuckyDraw}
              />

              <SettingItem
                icon={
                  <div className="bg-emerald-50 text-emerald-600">
                    <Mail size={18} />
                  </div>
                }
                title="Gửi thông báo Email"
                description="Gửi cập nhật và nhắc lịch đến người tham gia."
              />

              {isAdmin && (
                <SettingItem
                  icon={
                    <div className="bg-slate-100 text-slate-600">
                      <Trash size={18} />
                    </div>
                  }
                  title="Làm mới dữ liệu thống kê"
                  description="Xóa cache và đồng bộ lại dữ liệu báo cáo."
                  onClick={onResetStatistics}
                />
              )}
            </div>
          </>
        )}

        {/* Danger Zone */}
        <SectionTitle
          icon={<Trash2 size={16} />}
          title="Vùng nguy hiểm"
          danger
        />

        <div className="border border-rose-200 bg-rose-50 rounded-2xl overflow-hidden shadow-sm">
          {isOnlyMember ? (
            <button
              onClick={onLeaveTeam}
              className="w-full p-5 flex items-center justify-between hover:bg-rose-100/60 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white border border-rose-200 text-rose-500 flex items-center justify-center shadow-sm">
                  <LogOut size={18} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-semibold text-rose-700">
                    Rời ban tổ chức
                  </p>

                  <p className="text-xs text-rose-500 mt-1">
                    Bạn sẽ không còn quyền quản lý sự kiện này.
                  </p>
                </div>
              </div>

              <ChevronRight size={18} className="text-rose-300 group-hover:text-rose-500 transition-all" />
            </button>
          ) : (
            (isAdmin || userPerms.canEditEvent) && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full p-5 flex items-center justify-between hover:bg-rose-100/60 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-rose-200 text-rose-500 flex items-center justify-center shadow-sm">
                    <Trash2 size={18} />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-rose-700">
                      Xóa vĩnh viễn sự kiện
                    </p>

                    <p className="text-xs text-rose-500 mt-1">
                      Hành động này không thể hoàn tác.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all">
                  Xóa
                </div>
              </button>
            )
          )}
        </div>

        <div className="text-xs text-slate-400 px-1">
          * Một số thay đổi có thể ảnh hưởng đến toàn bộ dữ liệu sự kiện.
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({
  icon,
  title,
  danger
}) => {
  return (
    <div className="flex items-center gap-2 px-1">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${danger
            ? "bg-rose-100 text-rose-600"
            : "bg-slate-100 text-slate-600"
          }`}
      >
        {icon}
      </div>

      <h3
        className={`text-sm font-semibold tracking-wide ${danger
            ? "text-rose-600"
            : "text-slate-700"
          }`}
      >
        {title}
      </h3>
    </div>
  );
};

const SettingItem = ({
  icon,
  title,
  description,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="text-left">
          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="text-slate-300 group-hover:text-slate-500 transition-all"
      />
    </button>
  );
};

export default SettingsTab;