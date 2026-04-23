import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Calendar, Clock, MapPin, Users, Award, TrendingUp, Settings, ArrowLeft,
  Edit3, CheckCircle, Flag,
  Star,
  Gift,
  PlayCircle,
  Trophy,
  Target
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import eventService from "../../services/eventService";
import luckyDrawService from "../../services/luckyDrawService";

const EventDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [luckyDraw, setLuckyDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tổng quan");

  // ==================== FETCH DATA ====================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resEvent = await eventService.getEventById(id);
      setEvent(resEvent.data);
      
      // Nếu sự kiện có Lucky Draw, fetch thêm dữ liệu vòng quay
      console.log("Sự kiện có Lucky Draw?", resEvent.data?.hasLuckyDraw);
      if (resEvent.data?.hasLuckyDraw) {
        try {
          const resLucky = await luckyDrawService.findLuckyDrawByEventId(id);
          setLuckyDraw(resLucky.data);
        } catch (e) {
          console.warn("Sự kiện có cấu hình Lucky Draw nhưng chưa khởi tạo chiến dịch.");
        }
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [fetchData]);

  console.log("Event:", event);
  console.log("Lucky Draw:", luckyDraw);

  // ==================== HELPER FUNCTIONS ====================
  const formatFullDateTime = (iso) => {
    return new Date(iso).toLocaleString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('vi-VN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const formatDateTime = (iso) => new Date(iso).toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  // Chuyển trạng thái đăng ký sang tiếng Việt
  const getRegistrationStatus = (status) => {
    switch (status) {
      case "REGISTERED": return { label: "Đã đăng ký", color: "bg-blue-100 text-blue-700" };
      case "PENDING":    return { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" };
      case "ATTENDED":   return { label: "Đã tham gia", color: "bg-emerald-100 text-emerald-700" };
      case "CANCELLED":  return { label: "Đã hủy", color: "bg-red-100 text-red-700" };
      default:           return { label: status || "Không xác định", color: "bg-gray-100 text-gray-600" };
    }
  };

  // Chuyển vai trò ban tổ chức sang tiếng Việt
  const getOrganizerRole = (role) => {
    switch (role) {
      case "LEADER":     return { label: "Trưởng ban", color: "bg-purple-100 text-purple-700" };
      case "COORDINATOR":return { label: "Điều phối viên", color: "bg-indigo-100 text-indigo-700" };
      case "MEMBER":     return { label: "Thành viên", color: "bg-blue-100 text-blue-700" };
      case "ADVISOR":    return { label: "Cố vấn", color: "bg-teal-100 text-teal-700" };
      case "ORGANIZER":  return { label: "Ban tổ chức", color: "bg-gray-100 text-gray-700" };
      default:           return { label: role, color: "bg-gray-100 text-gray-600" };
    }
  };

  const statusConfig = {
    PUBLISHED: { label: "Đã công bố", color: "bg-blue-100 text-blue-700" },
    ONGOING: { label: "Đang diễn ra", color: "bg-green-100 text-green-700" },
    COMPLETED: { label: "Đã hoàn thành", color: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
  };

  const dynamicTabs = useMemo(() => {
    const baseTabs = [
      { key: "Tổng quan", label: "Tổng quan", icon: TrendingUp },
      { key: "Đăng ký", label: "Đăng ký", icon: Users },
      { key: "Điểm danh", label: "Điểm danh", icon: CheckCircle },
      { key: "Ban tổ chức", label: "Ban tổ chức", icon: Users },
      { key: "Diễn giả", label: "Diễn giả", icon: Star },
    ];

    if (event?.hasLuckyDraw) {
      baseTabs.push({ key: "Vòng quay", label: "Vòng quay may mắn", icon: Gift });
    }

    baseTabs.push({ key: "Thống kê", label: "Thống kê", icon: TrendingUp });
    baseTabs.push({ key: "Cài đặt", label: "Cài đặt", icon: Settings });
    return baseTabs;
  }, [event]);

  // Tránh lỗi khi event chưa load
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Không tìm thấy sự kiện hoặc đã xảy ra lỗi.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-xl"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[event.status] || { label: event.status, color: "bg-gray-100 text-gray-600" };

  const attendedCount = event.registrations?.filter(r => r.status === "ATTENDED").length || 0;
  const pendingCount = event.registrations?.filter(r => r.status === "PENDING").length || 0;
  const checkedInCount = event.registrations?.filter(r => r.checkedIn === true).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-80 w-full overflow-hidden">
        <img 
          src={event.coverImage || "https://picsum.photos/1200/400?tech"} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />

        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 hover:bg-white px-5 py-2.5 rounded-2xl text-sm font-medium shadow transition-all"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="absolute top-6 right-6">
          <span className={`px-5 py-2 rounded-2xl text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10 pb-12">
        {/* Header Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            {event.title}
          </h1>

          <p className="text-base text-gray-600 leading-relaxed">
            {event.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
            
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Ngày tổ chức</p>
                <p className="font-semibold text-sm">
                  {formatDate(event.startTime)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Thời gian</p>
                <p className="font-semibold text-sm">
                  {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Địa điểm</p>
                <p className="font-semibold text-sm">{event.location}</p>
                <p className="text-xs text-gray-500">
                  {event.eventMode === "OFFLINE" ? "Trực tiếp" : "Trực tuyến"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-400 overflow-x-auto bg-gray-50">
            {dynamicTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.key 
                      ? "border-blue-600 text-blue-600 bg-white" 
                      : "border-transparent text-gray-600 hover:text-slate-800"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* TỔNG QUAN */}
            {activeTab === "Tổng quan" && (
              <div className="space-y-6">
                {/* Các mốc thời gian */}
                <div>
                  <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <Flag className="text-amber-600" size={20} />
                    Các mốc thời gian quan trọng
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 font-medium">BẮT ĐẦU</p>
                          <p className="font-medium text-sm text-slate-800">
                            Thời gian sự kiện bắt đầu
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {formatFullDateTime(event.startTime)}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Clock className="text-red-600" size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 font-medium">HẠN ĐĂNG KÝ</p>
                          <p className="font-medium text-sm text-slate-800">
                            Thời gian đăng ký kết thúc
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {formatFullDateTime(event.registrationDeadline)}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Calendar className="text-emerald-600" size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500 font-medium">KẾT THÚC</p>
                          <p className="font-medium text-sm text-slate-800">
                            Thời gian sự kiện kết thúc
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {formatFullDateTime(event.endTime)}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Thông tin chung + Người tạo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  <div>
                    <h3 className="font-semibold text-base mb-2">Thông tin chung</h3>
                    <div className="space-y-1.5 text-sm">
                      <p><span className="text-gray-500">Chủ đề:</span> {event.eventTopic}</p>
                      <p><span className="text-gray-500">Loại sự kiện:</span> {event.type}</p>
                      <p><span className="text-gray-500">Số lượng tối đa:</span> {event.maxParticipants} người</p>
                      {event.notes && <p><span className="text-gray-500">Ghi chú:</span> {event.notes}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-2">Người tạo & Duyệt</h3>
                    <div className="space-y-3">
                      
                      <div>
                        <p className="text-gray-500 text-xs">Người tạo</p>
                        <p className="font-medium text-sm">{event.creator?.fullName}</p>
                        <p className="text-xs text-gray-500">{event.creator?.email}</p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs">Người duyệt</p>
                        <p className="font-medium text-sm">{event.approver?.fullName}</p>
                        <p className="text-xs text-gray-500">{event.approver?.email}</p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ĐĂNG KÝ */}
            {activeTab === "Đăng ký" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Danh sách đăng ký ({event.registeredCount})</h3>
                  <div className="text-sm text-gray-500">
                    Đã tham gia: <span className="font-medium text-emerald-600">{attendedCount}</span> | 
                    Chờ duyệt: <span className="font-medium text-amber-600">{pendingCount}</span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left font-medium text-gray-600">Mã vé</th>
                        <th className="p-4 text-left font-medium text-gray-600">Mã người tham gia</th>
                        <th className="p-4 text-left font-medium text-gray-600">Trạng thái</th>
                        <th className="p-4 text-left font-medium text-gray-600">Đăng ký lúc</th>
                        <th className="p-4 text-left font-medium text-gray-600">Thông tin bổ sung</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {event.registrations?.map((reg, idx) => {
                        const statusDisplay = getRegistrationStatus(reg.status);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono text-xs">
                              {reg.ticketCode || "—"}
                            </td>

                            <td className="p-4 font-medium text-slate-800">
                              {reg.participantAccountId}
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
                              >
                                {statusDisplay.label}
                              </span>
                            </td>

                            <td className="p-4 text-gray-600 text-xs">
                              {formatDateTime(reg.registeredAt)}
                            </td>

                            <td className="p-4 text-xs text-gray-600 whitespace-pre-wrap">
                              {reg.answersJson
                                ? JSON.stringify(reg.answersJson, null, 2)
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ĐIỂM DANH */}
            {activeTab === "Điểm danh" && (
              <div>
                <h3 className="font-semibold text-lg mb-6">
                  Điểm danh ({checkedInCount} / {event.registeredCount})
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left font-medium text-gray-600">Mã vé</th>
                        <th className="p-4 text-left font-medium text-gray-600">Người tham gia</th>
                        <th className="p-4 text-left font-medium text-gray-600">Trạng thái</th>
                        <th className="p-4 text-left font-medium text-gray-600">Check-in</th>
                        <th className="p-4 text-left font-medium text-gray-600">Thời gian check-in</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {event.registrations?.map((reg, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono text-xs">
                            {reg.ticketCode || "—"}
                          </td>

                          <td className="p-4 font-medium text-slate-800">
                            {reg.participantAccountId}
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                reg.status === "ATTENDED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {reg.status === "ATTENDED" ? "Đã tham gia" : "Chờ duyệt"}
                            </span>
                          </td>

                          <td className="p-4">
                            {reg.checkedIn ? (
                              <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                <CheckCircle size={16} /> Đã check-in
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Chưa check-in</span>
                            )}
                          </td>

                          <td className="p-4 text-xs text-gray-600">
                            {reg.checkInTime ? formatDateTime(reg.checkInTime) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BAN TỔ CHỨC */}
            {activeTab === "Ban tổ chức" && (
              <div>
                <h3 className="font-semibold text-lg mb-6">Ban tổ chức ({event.organizers?.length || 0} người)</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-left font-medium text-gray-600">Họ tên</th>
                        <th className="p-4 text-left font-medium text-gray-600">Email</th>
                        <th className="p-4 text-left font-medium text-gray-600">Vị trí</th>
                        <th className="p-4 text-left font-medium text-gray-600">Vai trò</th>
                        <th className="p-4 text-left font-medium text-gray-600">Ngày phân công</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {event.organizers?.map((org, idx) => {
                        const roleDisplay = getOrganizerRole(org.role);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">
                              {org.fullName}
                            </td>

                            <td className="p-4 text-gray-600">
                              {org.email}
                            </td>

                            <td className="p-4 text-gray-700">
                              {org.position}
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${roleDisplay.color}`}
                              >
                                {roleDisplay.label}
                              </span>
                            </td>

                            <td className="p-4 text-xs text-gray-600">
                              {formatDateTime(org.assignedAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Vòng quay" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* CARD THÔNG TIN CHƯƠNG TRÌNH */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Gift size={20} />
                        {luckyDraw?.luckyDraw?.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {luckyDraw?.luckyDraw?.description}
                      </p>
                    </div>

                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-600">
                      {luckyDraw?.luckyDraw?.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
                    <div>
                      <p className="text-gray-400">Bắt đầu</p>
                      <p className="font-medium">
                        {new Date(luckyDraw?.luckyDraw?.startTime).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Kết thúc</p>
                      <p className="font-medium">
                        {new Date(luckyDraw?.luckyDraw?.endTime).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Người tạo</p>
                      <p className="font-medium">{luckyDraw?.creator?.fullName}</p>
                    </div>

                    <div>
                      <p className="text-gray-400">Cơ chế</p>
                      <p className="font-medium">
                        {luckyDraw?.luckyDraw?.allowMultipleWins ? "Nhiều lần" : "1 lần"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* DANH SÁCH GIẢI THƯỞNG */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                      Cơ cấu giải thưởng
                    </h3>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {luckyDraw?.luckyDraw?.prizes?.map((prize) => (
                        <div
                          key={prize.id}
                          className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {prize.prizeName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {prize.description}
                            </p>
                          </div>

                          <span className="text-xs font-medium text-indigo-600">
                            x{prize.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DANH SÁCH TRÚNG GIẢI */}
                  <div className="col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Kết quả trúng thưởng
                      </h3>
                    </div>

                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-gray-200">
                        <tr>
                          <th className="p-4 text-left text-gray-600">Người tham gia</th>
                          <th className="p-4 text-left text-gray-600">Giải thưởng</th>
                          <th className="p-4 text-right text-gray-600">Thời gian</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {luckyDraw?.enrichedResults?.length > 0 ? (
                          luckyDraw.enrichedResults.map((item) => (
                            <tr key={item.result.id} className="hover:bg-slate-50">
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800">
                                    {item.result.winner?.fullName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.result.winner?.email}
                                  </span>
                                </div>
                              </td>

                              <td className="p-4 text-indigo-600 font-medium">
                                {item.result.prize?.prizeName}
                              </td>

                              <td className="p-4 text-right text-gray-500 text-xs">
                                {new Date(item.result.winTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="p-10 text-center text-gray-400">
                              Chưa có kết quả
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Diễn giả, Thống kê, Cài đặt giữ nguyên như cũ */}
            {activeTab === "Diễn giả" && (
              <div>
                  <h3 className="font-semibold text-lg mb-6">Danh sách diễn giả ({event.presenters?.length || 0} người)</h3>
                  
                  <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                    <table className="w-full text-sm">
  <thead className="bg-slate-50 border-b border-gray-200">
    <tr>
      <th className="p-4 text-left font-medium text-gray-600 w-16">Ảnh</th>
      <th className="p-4 text-left font-medium text-gray-600">Họ tên</th>
      <th className="p-4 text-left font-medium text-gray-600">Chức vụ / Đơn vị</th>
      <th className="p-4 text-left font-medium text-gray-600">Phiên trình bày</th>
      <th className="p-4 text-left font-medium text-gray-600">Thông tin thêm</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-gray-100">
    {event.presenters?.map((p, idx) => (
      <tr key={idx} className="hover:bg-slate-50 transition-colors">

        {/* Avatar */}
        <td className="p-4">
          <img 
            src={p.avatarUrl} 
            alt={p.fullName} 
            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
          />
        </td>

        {/* Name */}
        <td className="p-4 font-medium text-slate-800">
          <div>{p.fullName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{p.email}</div>
        </td>

        {/* Position */}
        <td className="p-4 text-gray-700">
          {p.position}
          <div className="text-xs text-gray-500">{p.department}</div>
        </td>

        {/* Session */}
        <td className="p-4 text-gray-700 font-medium">
          {p.session}
        </td>

        {/* Bio */}
        <td className="p-4 text-xs text-gray-600 max-w-[220px]">
          {p.bio ? (
            <div className="line-clamp-2">{p.bio}</div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>

      </tr>
    ))}
  </tbody>
</table>
</div>

                  {(!event.presenters || event.presenters.length === 0) && (
                  <div className="text-center py-16 text-gray-400">
                      Chưa có diễn giả nào được thêm vào sự kiện này.
                  </div>
                  )}
              </div>
            )}

           {activeTab === "Thống kê" && (
            <div className="space-y-8">
                {/* Thống kê tổng quan - Cards */}
                <div>
                <h3 className="font-semibold text-lg mb-5">Tổng quan số liệu</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                    <Users className="mx-auto mb-3 text-blue-600" size={40} />
                    <p className="text-4xl font-bold text-slate-800">{event.registeredCount}</p>
                    <p className="text-gray-500 mt-1">Tổng đăng ký</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                    <Award className="mx-auto mb-3 text-emerald-600" size={40} />
                    <p className="text-4xl font-bold text-emerald-600">{attendedCount}</p>
                    <p className="text-gray-500 mt-1">Đã tham gia</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                    <CheckCircle className="mx-auto mb-3 text-teal-600" size={40} />
                    <p className="text-4xl font-bold text-teal-600">{checkedInCount}</p>
                    <p className="text-gray-500 mt-1">Đã check-in</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                    <TrendingUp className="mx-auto mb-3 text-amber-600" size={40} />
                    <p className="text-4xl font-bold text-amber-600">
                        {event.registeredCount > 0 
                        ? Math.round((attendedCount / event.registeredCount) * 100) 
                        : 0}%
                    </p>
                    <p className="text-gray-500 mt-1">Tỷ lệ tham gia</p>
                    </div>
                </div>
                </div>

                {/* Bảng thống kê chi tiết */}
                <div>
                <h3 className="font-semibold text-lg mb-5">Thống kê chi tiết theo trạng thái</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                    <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                        <th className="p-5 text-left font-medium text-gray-600">Trạng thái</th>
                        <th className="p-5 text-right font-medium text-gray-600">Số lượng</th>
                        <th className="p-5 text-right font-medium text-gray-600">Tỷ lệ (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                        <td className="p-5 font-medium">Tổng số đăng ký</td>
                        <td className="p-5 text-right font-semibold text-blue-600">{event.registeredCount}</td>
                        <td className="p-5 text-right text-gray-500">100%</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                        <td className="p-5 font-medium flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            Đã tham gia (ATTENDED)
                        </td>
                        <td className="p-5 text-right font-semibold text-emerald-600">{attendedCount}</td>
                        <td className="p-5 text-right text-gray-500">
                            {event.registeredCount > 0 ? Math.round((attendedCount / event.registeredCount) * 100) : 0}%
                        </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                        <td className="p-5 font-medium flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            Chờ duyệt (PENDING)
                        </td>
                        <td className="p-5 text-right font-semibold text-amber-600">{pendingCount}</td>
                        <td className="p-5 text-right text-gray-500">
                            {event.registeredCount > 0 ? Math.round((pendingCount / event.registeredCount) * 100) : 0}%
                        </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                        <td className="p-5 font-medium flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            Đã hủy (CANCELLED)
                        </td>
                        <td className="p-5 text-right font-semibold text-red-600">
                            {event.registrations?.filter(r => r.status === "CANCELLED").length || 0}
                        </td>
                        <td className="p-5 text-right text-gray-500">
                            {event.registeredCount > 0 
                            ? Math.round(((event.registrations?.filter(r => r.status === "CANCELLED").length || 0) / event.registeredCount) * 100) 
                            : 0}%
                        </td>
                        </tr>
                        <tr className="hover:bg-gray-50 bg-gray-50 font-medium">
                        <td className="p-5">Đã check-in</td>
                        <td className="p-5 text-right text-teal-600">{checkedInCount}</td>
                        <td className="p-5 text-right text-gray-500">
                            {event.registeredCount > 0 ? Math.round((checkedInCount / event.registeredCount) * 100) : 0}%
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            )}

            {activeTab === "Cài đặt" && (
                <div>
                    <h3 className="font-semibold text-lg mb-6">Cài đặt sự kiện</h3>
                    
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-2xl">
                    <div className="space-y-8">
                        
                        {/* Lucky Draw */}
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Có rút thăm may mắn</p>
                            <p className="text-sm text-gray-500">Kích hoạt tính năng rút thăm cho người tham gia</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                            event.hasLuckyDraw 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                            {event.hasLuckyDraw ? "Đã bật" : "Tắt"}
                        </div>
                        </div>

                        {/* Finalized */}
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Hoàn tất sự kiện</p>
                            <p className="text-sm text-gray-500">Đánh dấu sự kiện đã kết thúc và không cho phép chỉnh sửa</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                            event.finalized 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                            {event.finalized ? "Đã hoàn tất" : "Chưa hoàn tất"}
                        </div>
                        </div>

                        {/* Archived */}
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Lưu trữ sự kiện</p>
                            <p className="text-sm text-gray-500">Di chuyển sự kiện vào kho lưu trữ</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                            event.archived 
                            ? "bg-slate-700 text-white" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                            {event.archived ? "Đã lưu trữ" : "Chưa lưu trữ"}
                        </div>
                        </div>

                        {/* Additional Info */}
                        {event.notes && (
                        <div className="pt-6 border-t">
                            <p className="font-medium mb-2">Ghi chú sự kiện</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border">
                            {event.notes}
                            </p>
                        </div>
                        )}
                    </div>
                    </div>

                    {/* Khu vực hành động */}
                    <div className="mt-10 flex flex-wrap gap-4">
                    {event.currentUserRole?.canEditEvent && (
                        <>
                        <button 
                            onClick={() => alert("Chức năng chỉnh sửa sự kiện đang được phát triển...")}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all"
                        >
                            <Edit3 size={20} />
                            Chỉnh sửa thông tin sự kiện
                        </button>

                        <button 
                            onClick={() => alert("Chức năng lưu trữ sự kiện sẽ được triển khai sau...")}
                            className="flex-1 md:flex-none border border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-2xl font-medium transition-all"
                        >
                            {event.archived ? "Bỏ lưu trữ" : "Lưu trữ sự kiện"}
                        </button>
                        </>
                    )}

                    {event.currentUserRole?.canManageRegistrations && (
                        <button 
                        onClick={() => alert("Mở quản lý đăng ký...")}
                        className="flex-1 md:flex-none border border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-2xl font-medium transition-all"
                        >
                        Quản lý đăng ký
                        </button>
                    )}
                    </div>

                    {/* Lưu ý */}
                    <p className="text-xs text-gray-400 mt-8 text-center">
                    Một số cài đặt chỉ có thể thay đổi khi sự kiện chưa được hoàn tất (Finalized = false)
                    </p>
                </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;