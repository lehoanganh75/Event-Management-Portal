import React, { useState, useEffect, useMemo, useRef } from "react";
import { Ticket, AlertCircle, Plus, X, Building2, Upload, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import eventService from "../../services/eventService";
import Layout from "../../components/layout/Layout";
import { showToast } from "../../utils/toast.jsx";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

// Components
import GuestEventsBanner from "../../components/events/guest/GuestEventsBanner";
import GuestEventsFilter from "../../components/events/guest/GuestEventsFilter";
import GuestEventsSchedule from "../../components/events/guest/GuestEventsSchedule";
import GuestEventCard from "../../components/events/guest/GuestEventCard";

const GuestEventsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CALENDAR");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Org creation modal state
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: "", email: "", phone: "", officeLocation: "",
    type: "CLUB", logoUrl: "", description: ""
  });
  const logoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh!");
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await eventService.uploadImage(formData);
      if (res.data && res.data.url) {
        setOrgForm(p => ({ ...p, logoUrl: res.data.url }));
        toast.success("Tải ảnh logo lên thành công!");
      }
    } catch (error) {
      console.error("Upload logo error:", error);
      toast.error("Lỗi khi tải ảnh logo lên. Vui lòng thử lại!");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const isStudent = user?.role?.toUpperCase() === "STUDENT";

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data || []);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải danh sách sự kiện", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => e.title?.toLowerCase().includes(search.toLowerCase()))
      .filter(e => activeFilter === "ALL" || e.status === activeFilter);
  }, [events, search, activeFilter]);

  const stats = useMemo(() => ({
    total: events.length,
    upcoming: events.filter(e => e.status === "PUBLISHED").length,
    ongoing: events.filter(e => e.status === "ONGOING").length,
    completed: events.filter(e => e.status === "COMPLETED").length,
  }), [events]);

  const handleSubmitOrg = async () => {
    if (!orgForm.name || !orgForm.email) {
      toast.error("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
      return;
    }
    setIsSubmittingOrg(true);
    try {
      await eventService.createOrganization({
        ...orgForm,
        ownerAccountId: user?.accountId || user?.id
      });
      toast.success("Yêu cầu thành lập đã được gửi! Vui lòng chờ Admin phê duyệt. Sau khi được duyệt, bạn có thể tạo sự kiện.");
      setIsOrgModalOpen(false);
      setOrgForm({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", logoUrl: "", description: "" });
    } catch (err) {
      toast.error("Không thể tạo yêu cầu thành lập");
      console.error(err);
    } finally {
      setIsSubmittingOrg(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] pb-20">
        <GuestEventsBanner
          stats={stats}
          viewMode={viewMode}
          setViewMode={setViewMode}
          t={t}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:-mt-8">

          {/* ── Banner kêu gọi thành lập CLB cho STUDENT chưa có tổ chức ── */}
          {isStudent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">Bạn muốn tổ chức sự kiện?</p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Thành lập CLB / Tổ chức và được Admin phê duyệt để có quyền tạo sự kiện riêng.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOrgForm({ name: "", email: "", phone: "", officeLocation: "", type: "CLUB", logoUrl: "", description: "" });
                  setIsOrgModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 shrink-0 active:scale-95"
              >
                <Plus size={16} />
                Thành lập tổ chức / CLB
              </button>
            </motion.div>
          )}

          {viewMode === "GRID" && (
            <GuestEventsFilter
              search={search}
              setSearch={setSearch}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              t={t}
            />
          )}

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Ticket className="text-indigo-500 animate-pulse" size={24} />
                </div>
              </div>
              <p className="text-slate-500 font-medium animate-pulse">Đang tải lịch trình của bạn...</p>
            </div>
          ) : viewMode === "GRID" ? (
            filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event, index) => (
                    <GuestEventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onClick={() => navigate(`/events/${event.id}`)}
                      t={t}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy sự kiện nào</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">
                  Có vẻ như bạn chưa đăng ký tham gia sự kiện nào hoặc không tìm thấy kết quả phù hợp.
                </p>
                <button
                  onClick={() => navigate("/events")}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Khám phá sự kiện ngay
                </button>
              </motion.div>
            )
          ) : (
            <GuestEventsSchedule
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              events={events}
              navigate={navigate}
              t={t}
            />
          )}
        </div>
      </div>

      {/* ── Modal: Thành lập tổ chức / CLB ── */}
      <AnimatePresence>
        {isOrgModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div onClick={() => setIsOrgModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">Thành lập tổ chức / CLB</h2>
                  <p className="text-xs text-indigo-100 mt-0.5">Yêu cầu sẽ được gửi đến Admin để phê duyệt</p>
                </div>
                <button onClick={() => setIsOrgModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full cursor-pointer text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-7 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tên tổ chức / CLB *</label>
                    <input value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: CLB Tin học - IUH" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Email liên hệ *</label>
                    <input value={orgForm.email} onChange={e => setOrgForm(p => ({ ...p, email: e.target.value }))} placeholder="VD: clbtinhoc@iuh.edu.vn" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Số điện thoại</label>
                    <input value={orgForm.phone} onChange={e => setOrgForm(p => ({ ...p, phone: e.target.value }))} placeholder="VD: 0987654321" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Văn phòng / Địa điểm</label>
                    <input value={orgForm.officeLocation} onChange={e => setOrgForm(p => ({ ...p, officeLocation: e.target.value }))} placeholder="VD: Phòng H3.1" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Loại hình</label>
                    <select value={orgForm.type} onChange={e => setOrgForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 cursor-pointer focus:bg-white focus:border-indigo-500 transition-all">
                      <option value="CLUB">Câu lạc bộ</option>
                      <option value="FACULTY">Khoa / Viện</option>
                      <option value="DEPARTMENT">Phòng ban</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 w-full flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    
                    {/* Preview Area */}
                    {orgForm.logoUrl ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100 flex-shrink-0 group shadow-sm bg-white">
                        <img src={orgForm.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                        <div 
                          onClick={() => setOrgForm(p => ({ ...p, logoUrl: "" }))}
                          className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                          title="Xóa logo"
                        >
                          <Trash2 size={16} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Building2 size={24} />
                      </div>
                    )}
                    
                    {/* Actions & Input */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500">Ảnh đại diện / Logo</label>
                        <button
                          type="button"
                          disabled={uploadingLogo}
                          onClick={() => logoInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-50 text-[11px] font-bold text-slate-700 rounded-lg border border-slate-200 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                        >
                          {uploadingLogo ? (
                            <>
                              <Loader2 className="animate-spin text-slate-500" size={11} />
                              <span>Đang tải...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={11} className="text-slate-550" />
                              <span>Tải ảnh lên</span>
                            </>
                          )}
                        </button>
                        {orgForm.logoUrl && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-100">Đã liên kết</span>
                        )}
                      </div>
                      <input 
                        value={orgForm.logoUrl} 
                        onChange={e => setOrgForm(p => ({ ...p, logoUrl: e.target.value }))} 
                        placeholder="Đường dẫn link logo (hoặc tải ảnh từ máy tính)..." 
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:border-indigo-500 transition-all text-slate-600" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Mô tả giới thiệu</label>
                  <textarea value={orgForm.description} onChange={e => setOrgForm(p => ({ ...p, description: e.target.value }))} placeholder="Giới thiệu mục tiêu hoạt động của CLB/Tổ chức..." rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 transition-all resize-none" />
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="block text-xs font-bold text-indigo-600 mb-1.5">Người sáng lập (mặc định):</span>
                  <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-indigo-100">
                    <div>
                      <span className="block text-sm font-bold text-slate-700">{user?.fullName || user?.username}</span>
                      <span className="block text-xs text-slate-500">{user?.email}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-black uppercase">Trưởng ban</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button onClick={() => setIsOrgModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 cursor-pointer">Hủy</button>
                <button
                  disabled={isSubmittingOrg}
                  onClick={handleSubmitOrg}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all"
                >
                  {isSubmittingOrg ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default GuestEventsPage;
