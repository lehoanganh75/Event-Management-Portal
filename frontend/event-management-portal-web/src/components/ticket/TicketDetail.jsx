import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, AlertCircle, Clock, MapPin, QrCode, Download, Printer, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import eventService from "../../services/eventService";
import QRCode from "react-qr-code";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Building2, Tag } from "lucide-react";

export default function TicketDetail({ eventId }) {
  const { user: authUser } = useAuth();
  const [event, setEvent] = useState();
  const [registration, setRegistration] = useState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [eventData, ticketData] = await Promise.all([
        eventService.getEventById(eventId),
        eventService.getTicketByEventId(eventId),
      ]);
      setEvent(eventData.data);
      setRegistration(ticketData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="py-10 text-center text-xs text-slate-500 italic">Đang tải vé điện tử...</div>;
  }

  if (!registration || !event) {
    return <div className="py-10 text-center text-xs text-rose-500 font-bold">Không tìm thấy thông tin vé</div>;
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
      {/* Physical Ticket Look */}
      <div className="relative bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col group">

        {/* Top Section - Movie Header Style */}
        <div className="relative bg-indigo-900 px-8 py-10">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 flex flex-col gap-2">
            <span className="w-fit px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-white/10 shadow-sm">
              {event.type}
            </span>
            <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight drop-shadow-lg">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Info Grid - The "Details" section */}
        <div className="px-8 py-5 grid grid-cols-2 gap-x-4 gap-y-4 bg-white">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={10} className="text-indigo-500" /> Ngày tổ chức
            </p>
            <p className="text-[12px] font-bold text-slate-800">
              {new Date(event.startTime).toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-end">
              <Clock size={10} className="text-indigo-500" /> Thời gian
            </p>
            <p className="text-[12px] font-bold text-slate-800">
              {new Date(event.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={10} className="text-rose-500" /> Địa điểm
            </p>
            <p className="text-[12px] font-bold text-slate-800 line-clamp-1">
              {event.location}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 size={10} className="text-indigo-500" /> Tổ chức
            </p>
            <p className="text-[11px] font-bold text-slate-700 truncate">
              {event.organizationName || "Ban tổ chức"}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-end">
              <Tag size={10} className="text-indigo-500" /> Phân loại
            </p>
            <p className="text-[11px] font-bold text-slate-700 uppercase">
              {event.type}
            </p>
          </div>
        </div>

        {/* The "Tear-off" Stub Divider */}
        <div className="relative flex items-center h-10 bg-white">
          <div className="absolute -left-5 w-10 h-10 bg-slate-100 rounded-full border border-slate-200/50 shadow-inner" />
          <div className="flex-1 border-t-2 border-dashed border-slate-100 mx-4" />
          <div className="absolute -right-5 w-10 h-10 bg-slate-100 rounded-full border border-slate-200/50 shadow-inner" />
        </div>

        {/* Stub Section - QR & Code */}
        <div className="px-8 pb-10 pt-4 bg-white text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            {registration.qrToken ? (
              <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <QRCode
                  value={registration.qrToken}
                  size={140}
                  level="H"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-slate-50 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
                <QrCode size={48} className="text-slate-200" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.print()}
              className="group flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-95"
            >
              <Download size={16} className="group-hover:animate-bounce" />
              Tải vé điện tử
            </button>

            <div className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${registration.checkedIn
              ? "bg-emerald-50 text-emerald-600"
              : "bg-indigo-50 text-indigo-600"
              }`}>
              {registration.checkedIn ? "✓ Đã Check-in" : "Chưa Check-in"}
            </div>
          </div>
        </div>

        {/* Brand Bar */}
        <div className="h-2 bg-indigo-600 w-full" />
      </div>

      {/* Security Tip */}
      <div className="mt-6 flex items-start gap-3 px-4 py-4 bg-amber-50 rounded-2xl border border-amber-100/50">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
          {event.notes || "Vui lòng không chia sẻ mã QR này cho bất kỳ ai. Nhân viên sẽ quét mã này tại cổng vào để xác nhận tư cách tham dự của bạn."}
        </p>
      </div>
    </div>
  );
}
