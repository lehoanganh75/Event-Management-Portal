import React from "react";
import {
  Users,
  Plus,
  Sparkles,
  X,
  Check,
  Search,
  MessageSquare,
} from "lucide-react";
import { Field, Input, Select } from "./BaseUI";

const PresentersSection = ({
  formData,
  setFormData,
  systemUsers,
  loadingUsers,
  presenterSearchKey,
  setPresenterSearchKey,
  showPresenterSuggestions,
  setShowPresenterSuggestions,
  fetchUsers,
  handleAIPresenterSuggestion,
  addPresenter,
  updatePresenter,
  removePresenter,
  confirmPresenter,
}) => {
  const filteredUsers = systemUsers.filter(
    (u) =>
      (u.profile?.fullName || "")
        .toLowerCase()
        .includes(presenterSearchKey.toLowerCase()) ||
      (u.email || "")
        .toLowerCase()
        .includes(presenterSearchKey.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-slate-500" />
            Khách mời / Người trình bày
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Thêm người trình bày cho sự kiện
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!showPresenterSuggestions)
                handleAIPresenterSuggestion();
              else setShowPresenterSuggestions(false);
            }}
            className="
              flex items-center gap-1.5
              px-3 py-2
              rounded-lg
              border border-indigo-200
              bg-white
              text-indigo-600
              text-xs font-medium
              hover:bg-indigo-50
              transition-colors
            "
          >
            <Sparkles size={13} />
            AI gợi ý
          </button>

          <button
            onClick={() => addPresenter()}
            className="
              flex items-center gap-1.5
              px-3 py-2
              rounded-lg
              bg-slate-100
              text-slate-700
              text-xs font-medium
              hover:bg-slate-200
              transition-colors
            "
          >
            <Plus size={13} />
            Thêm
          </button>
        </div>
      </div>

      {/* SEARCH */}
      {showPresenterSuggestions && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={presenterSearchKey}
              onChange={(e) =>
                setPresenterSearchKey(e.target.value)
              }
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
            {loadingUsers ? (
              <div className="md:col-span-2 text-center py-6 text-sm text-slate-400">
                Đang tải danh sách...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    addPresenter(u);
                    setShowPresenterSuggestions(false);
                    setPresenterSearchKey("");
                  }}
                  className="
                    flex items-center gap-3
                    p-3 rounded-xl
                    border border-slate-200
                    bg-white
                    hover:border-indigo-300
                    hover:bg-indigo-50/30
                    transition-colors
                    text-left
                  "
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <MessageSquare size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {u.profile?.fullName || u.username}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {u.email}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="md:col-span-2 text-center py-6 text-sm text-slate-400">
                Không tìm thấy người phù hợp
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {(formData.presenters || []).map(
          (presenter, idx) =>
            presenter.isConfirmed ? (
              <div
                key={idx}
                className="flex items-center gap-4 py-4 border-b border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <MessageSquare size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {presenter.fullName ||
                      presenter.email?.split("@")[0]}
                  </p>

                  <p className="text-xs text-slate-500">
                    {presenter.email}
                  </p>
                </div>

                {presenter.targetSessionName && (
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                    {presenter.targetSessionName === "ALL"
                      ? "Tất cả phiên"
                      : presenter.targetSessionName}
                  </span>
                )}

                <button
                  onClick={() =>
                    updatePresenter(
                      idx,
                      "isConfirmed",
                      false
                    )
                  }
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Sửa
                </button>

                <button
                  onClick={() => removePresenter(idx)}
                  className="text-rose-500 hover:text-rose-600"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div
                key={idx}
                className="space-y-4 py-2"
              >
                <Field label="Email người trình bày" required>
                  <Input
                    type="email"
                    value={presenter.email}
                    onChange={(e) =>
                      updatePresenter(
                        idx,
                        "email",
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!presenter.message || presenter.message.trim() === "") {
                          import("react-toastify").then(({ toast }) => toast.error("Vui lòng nhập Lời nhắn cho diễn giả!"));
                          return;
                        }
                        confirmPresenter(idx);
                      }
                    }}
                    placeholder="email@iuh.edu.vn"
                    autoFocus
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Lời nhắn">
                    <Input
                      value={presenter.message || ""}
                      onChange={(e) => {
                        updatePresenter(idx, "message", e.target.value);
                        updatePresenter(idx, "bio", e.target.value);
                      }}
                      placeholder="Mời làm diễn giả..."
                    />
                  </Field>

                  <Field label="Phiên đảm nhiệm">
                    <Select
                      value={presenter.targetSessionId}
                      onChange={(e) => {
                        const sid = e.target.value;

                        const sname =
                          sid === "ALL"
                            ? "ALL"
                            : formData.sessions?.find(
                              (s) =>
                                s.id === sid ||
                                s.orderIndex ===
                                parseInt(sid)
                            )?.title || "";

                        updatePresenter(
                          idx,
                          "targetSessionId",
                          sid
                        );

                        updatePresenter(
                          idx,
                          "targetSessionName",
                          sname
                        );
                      }}
                    >
                      <option value="">
                        -- Chưa gán --
                      </option>

                      <option value="ALL">
                        Tất cả các phiên
                      </option>

                      {(formData.sessions || []).map(
                        (s, i) => (
                          <option
                            key={i}
                            value={
                              s.id || s.orderIndex
                            }
                          >
                            {s.title}
                          </option>
                        )
                      )}
                    </Select>
                  </Field>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() =>
                      removePresenter(idx)
                    }
                    className="
                      px-4 py-2
                      rounded-lg
                      border border-rose-200
                      text-sm text-rose-600
                      hover:bg-rose-50
                    "
                  >
                    Xóa
                  </button>

                  <button
                    onClick={() => {
                      if (!presenter.message || presenter.message.trim() === "") {
                        import("react-toastify").then(({ toast }) => toast.error("Vui lòng nhập Lời nhắn cho diễn giả!"));
                        return;
                      }
                      confirmPresenter(idx);
                    }}
                    className="
                      flex items-center gap-2
                      px-4 py-2
                      rounded-lg
                      bg-indigo-600
                      text-white
                      text-sm
                      hover:bg-indigo-700
                    "
                  >
                    <Check size={14} />
                    Xác nhận
                  </button>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default PresentersSection;