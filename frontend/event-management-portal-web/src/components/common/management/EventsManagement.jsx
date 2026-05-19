import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileUp,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { showToast } from "../../../utils/toast.jsx";
import eventService from "../../../services/eventService";
import notificationService from "../../../services/notificationService";

import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";

import EventCreator from "../../event-planner/EventCreator";
import { extractDataFromDocx } from "../../../services/docxImportService";
import { exportToWord } from "../../event-planner/WordExporter";

// Components
import { STATUS_LABELS } from "./events-list/StatusConfig";
import EventStats from "./events-list/EventStats";
import EventTabs from "./events-list/EventTabs";
import EventFilterBar from "./events-list/EventFilterBar";
import EventTable from "./events-list/EventTable";
import ImportOverlay from "./events-list/ImportOverlay";
import ManagementModals from "./events-list/ManagementModals";

const EventsManagement = ({ type = "lecturer", mode = "all" }) => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { notifications } = useNotification();

  const isAdminMode = useMemo(() => {
    const role = user?.role;
    return role === "ADMIN" || role === "SUPER_ADMIN";
  }, [user]);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const lastProcessedNotificationId = React.useRef(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [scopeFilter, setScopeFilter] = useState(() => {
    return (type === "admin" && isAdminMode) ? "all" : "my";
  });

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 5;

  // Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);

  const [creatorConfig, setCreatorConfig] = useState({
    initialFormData: {},
    fromPlan: false,
    forceEventMode: false,
  });

  // Modals
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
  });

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    id: null,
  });

  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    defaultValue: "",
  });

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    event: null,
  });

  const [isImporting, setIsImporting] = useState(false);

  // Allowed statuses
  const allowedStatuses = useMemo(() => {
    if (mode === "plan") {
      return [
        "DRAFT",
        "PLAN_PENDING_APPROVAL",
        "PLAN_APPROVED",
        "REJECTED",
        "CONVERTED",
      ];
    }

    if (mode === "event") {
      return [
        "EVENT_PENDING_APPROVAL",
        "PUBLISHED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
      ];
    }

    return Object.keys(STATUS_LABELS);
  }, [mode]);

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      let res;

      if (scopeFilter === "all") {
        res =
          mode === "plan"
            ? await eventService.getAllPlans()
            : (isAdminMode
                ? await eventService.getAdminAllEvents()
                : await eventService.getEventsForUser());
      } else {
        res =
          mode === "plan"
            ? await eventService.getMyPlans()
            : await eventService.getMyEvents();
      }

      let allData = res.data || [];

      if (mode !== "all" && mode !== "my-events") {
        allData = allData.filter((e) =>
          allowedStatuses.includes(e.status)
        );
      }

      setEvents(allData);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [isAdminMode, mode, allowedStatuses, type, scopeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Notification refresh
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];

      if (
        latest.id !== lastProcessedNotificationId.current
      ) {
        lastProcessedNotificationId.current = latest.id;

        const relevantTypes = [
          "PLAN_SUBMITTED",
          "PLAN_APPROVED",
          "PLAN_REJECTED",
          "EVENT_SUBMITTED",
          "EVENT_APPROVED",
          "EVENT_REJECTED",
          "PLAN_CREATED",
          "EVENT_CREATED",
          "STATUS_UPDATED",
        ];

        if (relevantTypes.includes(latest.type)) {
          const timer = setTimeout(() => {
            fetchData();
          }, 800);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [notifications, fetchData]);

  // Stats
  const stats = useMemo(() => {
    const total = events.length;

    if (mode === "plan") {
      return {
        total,
        drafts: events.filter((e) => e.status === "DRAFT")
          .length,
        pending: events.filter(
          (e) => e.status === "PLAN_PENDING_APPROVAL"
        ).length,
        approved: events.filter(
          (e) => e.status === "PLAN_APPROVED"
        ).length,
        rejected: events.filter(
          (e) => e.status === "REJECTED"
        ).length,
      };
    }

    return {
      total,
      upcoming: events.filter((e) =>
        ["PUBLISHED", "EVENT_PENDING_APPROVAL"].includes(
          e.status
        )
      ).length,
      ongoing: events.filter(
        (e) => e.status === "ONGOING"
      ).length,
      completed: events.filter(
        (e) => e.status === "COMPLETED"
      ).length,
      totalRegistered: events.reduce(
        (sum, e) => sum + (e.registeredCount || 0),
        0
      ),
    };
  }, [events, mode]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    const list = events
      .filter(
        (e) =>
          e.title
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          e.location
            ?.toLowerCase()
            .includes(search.toLowerCase())
      )
      .filter((e) => {
        if (activeTab === "Tất cả") {
          if (statusFilter !== "ALL") {
            return e.status === statusFilter;
          }

          return true;
        }

        if (activeTab === "Kế hoạch") {
          return ["DRAFT", "REJECTED"].includes(e.status);
        }

        if (activeTab === "Chờ duyệt") {
          return ["PLAN_PENDING_APPROVAL"].includes(
            e.status
          );
        }

        if (activeTab === "Đã duyệt") {
          return ["PLAN_APPROVED"].includes(e.status);
        }

        if (activeTab === "Đã chuyển đổi") {
          return ["CONVERTED"].includes(e.status);
        }

        if (activeTab === "Chờ duyệt sự kiện") {
          return ["EVENT_PENDING_APPROVAL"].includes(
            e.status
          );
        }

        if (activeTab === "Công bố") {
          return e.status === "PUBLISHED";
        }

        if (activeTab === "Đang diễn ra") {
          return e.status === "ONGOING";
        }

        if (activeTab === "Hoàn thành") {
          return e.status === "COMPLETED";
        }

        if (activeTab === "Đã hủy") {
          return e.status === "CANCELLED";
        }

        return true;
      });

    // Sort by status: ONGOING -> PUBLISHED/UPCOMING -> COMPLETED -> others
    const statusOrder = {
      ONGOING: 1,
      PUBLISHED: 2,
      UPCOMING: 2,
      PLAN_APPROVED: 2.5,
      COMPLETED: 3,
    };

    return [...list].sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt);
    });
  }, [events, search, statusFilter, activeTab]);

  // Pagination
  const totalPages = Math.ceil(
    filteredEvents.length / perPage
  );

  const currentEvents = filteredEvents.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Submit approval
  const handleSubmitForApproval = async (
    id,
    title
  ) => {
    setSubmittingId(id);

    try {
      await eventService.submitPlanForApproval(id);

      await notificationService.sendNotification({
        userProfileId: user?.accountId || user?.id,
        title: "Gửi phê duyệt thành công",
        message: `Sự kiện "${title}" đã được gửi tới Quản trị viên.`,
        type: "SYSTEM",
      });

      fetchData();
    } catch (error) {
      showToast("Gửi phê duyệt thất bại", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  // Delete
  const handleDelete = async () => {
    const { id } = deleteModal;

    if (!id) return;

    try {
      await eventService.deleteEvent(id);

      showToast("Đã xóa sự kiện thành công", "success");

      setDeleteModal({
        isOpen: false,
        id: null,
      });

      fetchData();
    } catch (error) {
      showToast("Lỗi khi xóa sự kiện", "error");
    }
  };

  // Cancel
  const handleCancel = async () => {
    const { id } = cancelModal;

    if (!id) return;

    try {
      await eventService.cancelEvent(id);

      showToast("Đã hủy sự kiện thành công", "success");

      setCancelModal({
        isOpen: false,
        id: null,
      });

      fetchData();
    } catch (error) {
      showToast("Lỗi khi hủy sự kiện", "error");
    }
  };

  // Export word
  const handleExportWord = async (event) => {
    try {
      await exportToWord(
        {
          ...event,
          eventTitle: event.title,
          eventPurpose: event.description,
          createdByName:
            user?.profile?.fullName ||
            user?.username ||
            "",
        },
        user?.accountId || user?.id
      );

      showToast("Đã xuất file Word", "success");
    } catch (err) {
      showToast(
        "Lỗi xuất Word: " + err.message,
        "error"
      );
    }
  };

  // View
  const handleView = (e) => {
    if (
      mode === "plan" ||
      e.status.includes("PLAN") ||
      e.status === "DRAFT"
    ) {
      setPreviewModal({
        isOpen: true,
        event: e,
      });

      return;
    }

    navigate(
      isAdminMode
        ? `/admin/events/${e.id}`
        : `/${type}/events/${e.id}`
    );
  };

  // Edit
  const handleEdit = (event) => {
    setCreatorConfig({
      initialFormData: {
        ...event,
        eventTitle: event.title || "",
        eventPurpose: event.description || "",
        eventType: event.type || "OTHER",
      },
      fromPlan: event.status.includes("PLAN"),
    });

    setShowEventCreator(true);
  };

  // Update status
  const handleStatusUpdate = async (
    id,
    newStatus
  ) => {
    if (!isAdminMode) return;

    const oldEvents = [...events];

    const currentEvent = oldEvents.find(
      (e) => e.id === id
    );

    if (!currentEvent) return;

    const performUpdate = async (reason = "") => {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: newStatus }
            : e
        )
      );

      try {
        switch (newStatus) {
          case "PLAN_APPROVED":
            await eventService.approvePlan(id);
            break;

          case "PUBLISHED":
            await eventService.approveEvent(id);
            break;

          case "REJECTED":
            await eventService.rejectPlan(
              id,
              reason || "Cập nhật bởi Admin"
            );
            break;

          default:
            await eventService.updateEvent(id, {
              ...currentEvent,
              status: newStatus,
            });
        }

        showToast(
          "Cập nhật trạng thái thành công",
          "success"
        );

        fetchData();
      } catch (err) {
        setEvents(oldEvents);

        showToast(
          "Không thể cập nhật trạng thái",
          "error"
        );
      }
    };

    if (
      newStatus === "REJECTED" ||
      newStatus === "CANCELLED"
    ) {
      setPromptModal({
        isOpen: true,
        title:
          newStatus === "REJECTED"
            ? "Từ chối"
            : "Hủy",
        message: "Vui lòng nhập lý do...",
        onConfirm: (reason) => {
          performUpdate(reason);

          setPromptModal((prev) => ({
            ...prev,
            isOpen: false,
          }));
        },
      });

      return;
    }

    performUpdate();
  };

  // Import docx
  const handleImportDocx = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      showToast(
        "Vui lòng chọn file định dạng .docx",
        "error"
      );

      return;
    }

    setIsImporting(true);

    try {
      showToast(
        "Đang phân tích nội dung kế hoạch...",
        "info"
      );

      const data = await extractDataFromDocx(file);

      if (
        !data ||
        (!data.extracted && !data.rawText)
      ) {
        throw new Error(
          "Không thể trích xuất thông tin"
        );
      }

      setCreatorConfig({
        initialFormData: {
          eventTitle:
            data.extracted?.title ||
            "Kế hoạch sự kiện mới",

          eventPurpose:
            data.extracted?.purpose ||
            data.rawText ||
            "",

          eventType: "WORKSHOP",
          eventMode: "OFFLINE",
        },

        fromPlan: false,
        isEdit: false,
        startAtStep: 1,
      });

      setShowEventCreator(true);

      showToast(
        "Đã trích xuất thông tin thành công",
        "success"
      );
    } catch (err) {
      console.error(err);

      showToast(
        "Lỗi khi nhập dữ liệu",
        "error"
      );
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  // Create handlers
  const handleSelectPlan = (data) => {
    setCreatorConfig({
      initialFormData:
        data.initialFormData || {},
      fromPlan: data.fromPlan || false,
      forceEventMode: mode === "event",
      startAtStep: data.startAtStep || 1,
    });

    setIsCreateModalOpen(false);
    setShowEventCreator(true);
  };

  const handleCreateNew = (data = {}) => {
    setCreatorConfig({
      initialFormData: data.initialFormData || {},
      fromPlan: data.fromPlan || false,
      forceEventMode: mode === "event",
      startAtStep: data.startAtStep || 1,
    });

    setIsCreateModalOpen(false);
    setShowEventCreator(true);
  };

  // Creator
  if (showEventCreator) {
    return (
      <EventCreator
        onBack={() => {
          setShowEventCreator(false);
          fetchData();
        }}
        initialFormData={
          creatorConfig.initialFormData
        }
        fromPlan={creatorConfig.fromPlan}
        planId={creatorConfig.initialFormData.id}
        startAtStep={creatorConfig.startAtStep}
        forceEventMode={
          creatorConfig.forceEventMode
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <ImportOverlay isImporting={isImporting} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-semibold shadow-sm">
              E
            </div>

            <h1 className="text-2xl font-semibold text-slate-800">
              {scopeFilter === "all"
                ? mode === "plan"
                  ? "Tất cả kế hoạch"
                  : "Tất cả sự kiện"
                : mode === "plan"
                  ? "Kế hoạch của tôi"
                  : "Sự kiện của tôi"}
            </h1>

            <div className="flex bg-slate-200/60 p-0.5 rounded-xl border border-slate-200 ml-2">
              <button
                onClick={() => {
                  setScopeFilter("all");
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  scopeFilter === "all"
                    ? "bg-white text-[#1E40AF] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => {
                  setScopeFilter("my");
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  scopeFilter === "my"
                    ? "bg-white text-[#1E40AF] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Của tôi
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-2 ml-12">
            Theo dõi và quản lý toàn bộ hoạt động
          </p>
        </div>

        {(isAdminMode ||
          user?.role === "LECTURER" ||
          user?.role === "MEMBER" ||
          mode === "plan") && (
            <div className="flex items-center gap-3">
              {/* Import */}
              <label
                className={`
                flex items-center gap-2
                px-4 py-2.5
                rounded-xl
                border border-indigo-200
                bg-indigo-50
                text-indigo-700
                text-sm font-medium
                hover:bg-indigo-100
                transition-all
                cursor-pointer
                ${isImporting
                    ? "opacity-50 pointer-events-none"
                    : ""
                  }
              `}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".docx"
                  onChange={handleImportDocx}
                  disabled={isImporting}
                />

                {isImporting ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <FileUp size={17} />
                )}

                {isImporting
                  ? "Đang xử lý..."
                  : "Import Word"}
              </label>

              {/* Create */}
              <button
                onClick={() =>
                  setIsCreateModalOpen(true)
                }
                className="
                flex items-center gap-2
                px-4 py-2.5
                rounded-xl
                bg-[#1E40AF]
                text-white
                text-sm font-medium
                hover:bg-[#1d4ed8]
                transition-all
                shadow-sm
              "
              >
                <Plus size={17} />

                {mode === "plan"
                  ? "Tạo kế hoạch"
                  : "Tạo sự kiện"}
              </button>
            </div>
          )}
      </div>

      {/* Stats */}
      <EventStats mode={mode} stats={stats} />

      {/* Tabs */}
      <EventTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
        events={events}
        mode={mode}
      />

      {/* Filter */}
      <EventFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        allowedStatuses={allowedStatuses}
        setPage={setPage}
        setActiveTab={setActiveTab}
      />

      {/* Table */}
      <EventTable
        loading={loading}
        currentEvents={currentEvents}
        mode={mode}
        isAdminMode={isAdminMode}
        submittingId={submittingId}
        handleView={handleView}
        handleEdit={handleEdit}
        handleDelete={(id) =>
          setDeleteModal({
            isOpen: true,
            id,
          })
        }
        handleExportWord={handleExportWord}
        handleSubmitForApproval={
          handleSubmitForApproval
        }
        handleStatusUpdate={handleStatusUpdate}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
            disabled={page === 1}
            className="
              w-10 h-10
              rounded-xl
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-slate-500
              hover:bg-slate-100
              disabled:opacity-50
              transition-all
            "
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`
                w-10 h-10
                rounded-xl
                text-sm font-medium
                transition-all
                ${page === num
                  ? "bg-[#1E40AF] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={page === totalPages}
            className="
              w-10 h-10
              rounded-xl
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-slate-500
              hover:bg-slate-100
              disabled:opacity-50
              transition-all
            "
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modals */}
      <ManagementModals
        mode={mode}
        isAdminMode={isAdminMode}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        handleDelete={handleDelete}
        cancelModal={cancelModal}
        setCancelModal={setCancelModal}
        handleCancel={handleCancel}
        promptModal={promptModal}
        setPromptModal={setPromptModal}
        previewModal={previewModal}
        setPreviewModal={setPreviewModal}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={
          setIsCreateModalOpen
        }
        handleSelectPlan={handleSelectPlan}
        handleCreateNew={handleCreateNew}
        handleExportWord={handleExportWord}
        handleStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default EventsManagement;