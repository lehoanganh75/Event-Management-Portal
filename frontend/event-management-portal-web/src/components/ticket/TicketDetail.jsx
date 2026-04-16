import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, AlertCircle, Clock, MapPin } from "lucide-react";
import QRCode from "react-qr-code";
import eventService from "../../services/eventService";

export default function TicketDetail({ eventId }) {
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
    <div className="w-full mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-[24px] shadow-xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Event Header Mini */}
        <div className="p-4 flex gap-4 bg-slate-50 border-b border-slate-100">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-16 h-16 object-cover rounded-xl shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-black uppercase text-blue-600 tracking-tighter">
              {event.type}
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 leading-tight line-clamp-2 uppercase">
              {event.title}
            </h3>
            <p className="mt-1 text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <Clock size={12} className="text-blue-500" />
              {new Date(event.startTime).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Divider with Cut-out effects */}
        <div className="relative flex items-center justify-between px-4 h-6">
          <div className="w-6 h-6 bg-[#f8fafc] border border-slate-100 rounded-full -ml-7 shadow-inner" />
          <div className="flex-1 border-t border-dashed border-slate-200 mx-2" />
          <div className="w-6 h-6 bg-[#f8fafc] border border-slate-100 rounded-full -mr-7 shadow-inner" />
        </div>

        {/* QR Section - Tinh giản */}
        <div className="px-6 pb-6 pt-2 text-center">
          <p className="uppercase text-[9px] tracking-[2px] font-black text-slate-300 mb-4">
            MÃ QR CHECK-IN
          </p>
          <div className="inline-block p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
            <QRCode 
               value={registration.qrToken || ""} 
               size={140} // Giảm size QR
               fgColor="#1e293b" 
            />
          </div>
          
          <div className="mt-5">
            <p className="font-mono text-xl font-black tracking-[4px] text-slate-900 leading-none">
              {registration.ticketCode}
            </p>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                registration.checkedIn 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
                {registration.checkedIn ? "✓ Đã Check-in" : registration.status}
            </div>
          </div>
        </div>

        {/* Footer Details - Chữ nhỏ hơn */}
        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">Địa điểm</p>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5 line-clamp-1 truncate italic">
                {event.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">Ngày đăng ký</p>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                {new Date(registration.registeredAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
        </div>
      </div>

      {/* Mini Warning */}
      <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-center">
        <AlertCircle className="text-blue-500 shrink-0" size={14} />
        <p className="text-[10px] text-blue-700 font-medium leading-tight">
          {event.notes || "Vui lòng chuẩn bị mã QR này tại lối vào để thủ tục check-in nhanh chóng hơn."}
        </p>
      </div>
    </div>
  );
}