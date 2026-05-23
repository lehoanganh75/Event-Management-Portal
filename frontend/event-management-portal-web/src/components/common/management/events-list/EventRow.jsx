import React from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Send,
  Download,
  Check,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_COLOR,
} from "./StatusConfig";

const ACTION_STYLES = {
  blue: "text-[#1E40AF] hover:bg-blue-50",
  indigo: "text-indigo-600 hover:bg-indigo-50",
  amber: "text-amber-600 hover:bg-amber-50",
  green: "text-emerald-600 hover:bg-emerald-50",
  red: "text-red-600 hover:bg-red-50",
  slate: "text-slate-600 hover:bg-slate-100",
};

const EventRow = ({
  event,
  mode,
  isAdminMode,
  submittingId,
  handleView,
  handleEdit,
  handleDelete,
  handleExportWord,
  handleSubmitForApproval,
  handleStatusUpdate,
}) => {
  const creatorName =
    event.createdByName ||
    event.creator?.fullName ||
    event.createdBy ||
    "Hệ thống";

  const approverName =
    event.approvedByName ||
    event.approver?.fullName;

  const isApprovedStatus = [
    "PLAN_APPROVED",
    "PUBLISHED",
    "ONGOING",
    "COMPLETED",
  ].includes(event.status);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4">
        <p 
          className="font-semibold text-slate-800 max-w-[240px] whitespace-normal break-words"
          title={event.title}
        >
          {event.title}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-slate-600 max-w-[180px] whitespace-normal break-words">
          {event.location || "Chưa cập nhật"}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {new Date(event.startTime).toLocaleDateString("vi-VN")}
      </td>

      <td className="px-4 py-4">
        {isAdminMode ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center text-xs font-semibold shrink-0">
              {creatorName.substring(0, 1).toUpperCase()}
            </div>

            <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
              {creatorName}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {approverName ? (
              <>
                <CheckCircle size={15} className="text-emerald-600" />
                <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
                  {approverName}
                </span>
              </>
            ) : isApprovedStatus ? (
              <>
                <CheckCircle size={15} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Đã phê duyệt
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">
                Chưa duyệt
              </span>
            )}
          </div>
        )}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[event.status] ||
            "bg-slate-100 text-slate-600"
            }`}
        >
          {STATUS_LABELS[event.status] || event.status}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-center gap-1">
          <ActionButton
            onClick={() => handleView(event)}
            icon={<Eye size={16} />}
            color="blue"
            title="Xem chi tiết"
          />

          {mode === "plan" && (
            <ActionButton
              onClick={() => handleExportWord(event)}
              icon={<Download size={16} />}
              color="indigo"
              title="Lưu file Word"
            />
          )}

          {(event.currentUserRole?.canEditEvent ||
            (!isAdminMode &&
              (event.status === "DRAFT" ||
                event.status === "REJECTED"))) && (
              <ActionButton
                onClick={() => handleEdit(event)}
                icon={<Edit2 size={16} />}
                color="amber"
                title="Chỉnh sửa"
              />
            )}

          {!isAdminMode &&
            (event.status === "DRAFT" ||
              event.status === "REJECTED") && (
              <button
                onClick={() =>
                  handleSubmitForApproval(
                    event.id,
                    event.title
                  )
                }
                disabled={submittingId === event.id}
                title="Gửi phê duyệt"
                className="
                  w-9 h-9
                  rounded-lg
                  flex items-center justify-center
                  text-emerald-600
                  hover:bg-emerald-50
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition
                "
              >
                {submittingId === event.id ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}
              </button>
            )}

          {(isAdminMode ||
            (!isAdminMode && event.status === "DRAFT")) && (
              <ActionButton
                onClick={() => handleDelete(event.id)}
                icon={<Trash2 size={16} />}
                color="red"
                title="Xóa"
              />
            )}

          {isAdminMode &&
            event.status === "PLAN_PENDING_APPROVAL" && (
              <>
                <ActionButton
                  onClick={() =>
                    handleStatusUpdate(
                      event.id,
                      "PLAN_APPROVED"
                    )
                  }
                  icon={<Check size={16} />}
                  color="green"
                  title="Phê duyệt"
                />

                <ActionButton
                  onClick={() =>
                    handleStatusUpdate(event.id, "REJECTED")
                  }
                  icon={<X size={16} />}
                  color="red"
                  title="Từ chối"
                />
              </>
            )}

          {isAdminMode &&
            event.status === "EVENT_PENDING_APPROVAL" && (
              <>
                <ActionButton
                  onClick={() =>
                    handleStatusUpdate(
                      event.id,
                      "PUBLISHED"
                    )
                  }
                  icon={<Check size={16} />}
                  color="green"
                  title="Phê duyệt sự kiện"
                />

                <ActionButton
                  onClick={() =>
                    handleStatusUpdate(event.id, "REJECTED")
                  }
                  icon={<X size={16} />}
                  color="red"
                  title="Từ chối sự kiện"
                />
              </>
            )}
        </div>
      </td>
    </tr>
  );
};

const ActionButton = ({
  onClick,
  icon,
  color = "slate",
  title,
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-9 h-9
        rounded-lg
        flex items-center justify-center
        transition
        ${ACTION_STYLES[color] || ACTION_STYLES.slate}
      `}
    >
      {icon}
    </button>
  );
};

export default EventRow;