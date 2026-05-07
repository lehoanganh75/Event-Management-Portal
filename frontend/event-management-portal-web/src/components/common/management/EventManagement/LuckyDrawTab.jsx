import React from "react";
import { Gift, Waves, Trophy, Star, Mail, Phone } from "lucide-react";
import { toast } from "react-toastify";
import luckyDrawService from "../../../../services/luckyDrawService";

const LuckyDrawTab = ({ 
  event, 
  luckyDraw, 
  handleOpenDuckRace, 
  onRefresh,
  isAdmin,
  navigate 
}) => {
  return (
    <div className="space-y-6">
      {console.log("luckyDraw response in FE:", luckyDraw)}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Gift size={24} className="text-amber-500" /> {luckyDraw?.luckyDraw?.title || luckyDraw?.title || "Chương trình vòng quay"}
          </h2>
          <div className="flex items-center gap-3">
            {event?.currentUserRole?.organizerRole === 'LEADER' && (
              <button
                onClick={handleOpenDuckRace}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-200"
              >
                <Waves size={16} /> Mở Đua Vịt (LIVE)
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng giải thưởng</p>
            <p className="text-xl font-black text-slate-800">{(luckyDraw?.luckyDraw?.prizes?.length || luckyDraw?.prizes?.length) || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã trúng giải</p>
            <p className="text-xl font-black text-emerald-600">{(luckyDraw?.enrichedResults?.length || luckyDraw?.results?.length) || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Người tham gia</p>
            <p className="text-xl font-black text-blue-600">{(luckyDraw?.luckyDraw?.entries?.length || luckyDraw?.entries?.length) || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
            <p className={`text-sm font-black mt-1 ${(luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "ACTIVE" ? "text-emerald-600 animate-pulse" :
              (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "COMPLETED" ? "text-blue-600" :
                (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "CANCELLED" ? "text-rose-600" : "text-amber-600"
              }`}>
              {
                (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "PENDING" ? "Chờ bắt đầu" :
                  (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "ACTIVE" ? "Đang diễn ra" :
                    (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "COMPLETED" ? "Đã kết thúc" :
                      (luckyDraw?.luckyDraw?.status || luckyDraw?.status) === "CANCELLED" ? "Đã hủy" : "Không rõ"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Prize Structure and Participants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cơ cấu giải thưởng */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 bg-slate-50/50 border-b border-gray-100 font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
              <span>Cơ cấu giải thưởng</span>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{(luckyDraw?.luckyDraw?.prizes || luckyDraw?.prizes)?.length || 0} Loại</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
              {(luckyDraw?.luckyDraw?.prizes || luckyDraw?.prizes)?.map(p => {
                const total = p.quantity || 1;
                const remaining = p.remainingQuantity ?? p.quantity ?? 1;
                const pct = Math.round((remaining / total) * 100);
                return (
                  <div key={p.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/60 transition-all cursor-default select-none">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-800">{p.prizeName || p.name}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{p.description || "Quà tặng vòng quay may mắn"}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg tracking-wider border border-indigo-100">
                          {remaining} / {total}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Còn lại</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${pct > 50 ? "from-indigo-500 to-indigo-400" : "from-amber-500 to-amber-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Người tham gia */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 bg-slate-50/50 border-b border-gray-100 font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
              <span>Người tham gia</span>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{(luckyDraw?.luckyDraw?.entries?.length || luckyDraw?.entries?.length) || 0} Người</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
              {(luckyDraw?.luckyDraw?.entries || luckyDraw?.entries)?.map(entry => {
                const user = entry?.profile || entry?.user || entry?.participant || {};
                return (
                  <div key={entry.id} className="p-4 flex justify-between items-center hover:bg-slate-50/60 transition-all cursor-default select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center text-white font-black text-sm shadow-sm select-none">
                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-800">{user.fullName || "N/A"}</span>
                        <span className="text-xs text-slate-400 font-medium">{user.email || "Email hidden"}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider select-none ${entry.status === "VALID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                      {entry.status === "VALID" ? "Hợp lệ" : entry.status}
                    </span>
                  </div>
                );
              })}
              {(!luckyDraw?.luckyDraw?.entries?.length && !luckyDraw?.entries?.length) && (
                <div className="p-8 text-center text-slate-400 text-xs">Chưa có ai tham gia</div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Danh sách trúng thưởng */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="p-4 bg-slate-50/50 border-b border-gray-100 font-extrabold text-slate-800 tracking-wide flex items-center justify-between">
            <span>Danh sách trúng thưởng</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{(luckyDraw?.enrichedResults || luckyDraw?.results)?.length || 0} Người</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
            {(luckyDraw?.enrichedResults || luckyDraw?.results)?.map(res => {
              const r = res?.result || res;
              const timeStr = r.winTime || r.drawTime;
              const formattedTime = timeStr ? new Date(timeStr).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              }) : "N/A";
              return (
                <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-all cursor-default select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0 overflow-hidden select-none border border-emerald-200">
                      {r.winner?.avatarUrl ? (
                        <img src={r.winner.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        r.winner?.fullName?.charAt(0).toUpperCase() || "N"
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                        {r.winner?.fullName || "N/A"}
                        {r.winner?.phone && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
                            {r.winner.phone}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{r.winner?.email || "Email hidden"}</span>
                      {formattedTime && (
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">Trúng giải lúc: {formattedTime}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    <span className="text-xs font-extrabold px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-sm select-none">
                      {r.wonPrize?.name || r.prize?.prizeName || r.prize?.name || "Giải thưởng"}
                    </span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const newClaimed = !r.claimed;
                          await luckyDrawService.updateClaimed(r.id, newClaimed);
                          toast.success("Cập nhật trạng thái thành công!");
                          onRefresh();
                        } catch (err) {
                          console.error("Lỗi khi cập nhật trạng thái nhận quà", err);
                        }
                      }}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border select-none transition-all ${r.claimed
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/50'
                        : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/50'
                        }`}
                    >
                      {r.claimed ? 'Đã nhận quà' : 'Chưa nhận quà'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyDrawTab;
