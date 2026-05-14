import React from "react";
import {
  Briefcase,
  User,
  Clock3,
  ShieldCheck,
  Mail,
} from "lucide-react";

const InvitationSidebar = ({
  invitation,
  isPresenter,
  formatOnlyDate,
}) => {
  const infoItems = [
    {
      icon: isPresenter ? Briefcase : User,
      label: "Vị trí",
      value: isPresenter
        ? "Diễn giả chủ trì"
        : invitation.targetRole || "Thành viên",
    },
    {
      icon: Clock3,
      label: "Hạn phản hồi",
      value: formatOnlyDate(invitation.expiredAt),
    },
    {
      icon: ShieldCheck,
      label: "Hạn đăng ký",
      value: formatOnlyDate(
        invitation.event?.registrationDeadline
      ),
    },
    {
      icon: User,
      label: "Người mời",
      value:
        invitation.inviter?.fullName ||
        "Ban tổ chức",
      sub:
        invitation.inviter?.email || null,
    },
  ];

  return (
    <aside className="md:w-[340px] bg-slate-50 border-r border-slate-100 p-8 flex flex-col justify-between">
      <div>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          IUH Event Portal
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
            {isPresenter
              ? "Lời mời Diễn giả"
              : "Lời mời Ban tổ chức"}
          </h1>

          <p className="text-sm leading-7 text-slate-500">
            Xin chào{" "}
            <span className="font-semibold text-slate-700">
              {invitation.inviteeName}
            </span>
            , bạn đã nhận được lời mời tham gia sự
            kiện từ{" "}
            <span className="font-semibold text-indigo-600">
              {invitation.inviter?.fullName ||
                "Ban tổ chức"}
            </span>
            .
          </p>
        </div>

        {/* Info list */}
        <div className="space-y-5">
          {infoItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon
                    size={18}
                    className="text-indigo-500"
                  />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    {item.label}
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {item.value}
                  </p>

                  {item.sub && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <Mail size={12} />
                      {item.sub}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer quote */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        <p className="text-sm italic text-slate-400 leading-6">
          “Sự hiện diện của bạn góp phần tạo nên
          thành công cho sự kiện.”
        </p>
      </div>
    </aside>
  );
};

export default InvitationSidebar;