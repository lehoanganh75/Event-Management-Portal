import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Plus, Eye, Edit, Trash2, Gift, Award, 
  Users, Target, X, Settings2, Save, AlertCircle, Loader2, Calendar, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// IMPORT CONTEXT
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { useLuckyDraw } from '../../context/LuckyDrawContext';

const STATUS_CONFIG = {
  PENDING: { label: "Chờ kích hoạt", color: "bg-amber-100 text-amber-600 border-amber-200" },
  ACTIVE: { label: "Đang diễn ra", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-blue-100 text-blue-600 border-blue-200" },
  CANCELLED: { label: "Đã hủy", color: "bg-rose-100 text-rose-600 border-rose-200" },
};

const SpinnerManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const eventTitleFromUrl = searchParams.get("title");

  // --- CONTEXT ---
  const { user } = useAuth();
  const { events: eventService } = useEvent();
  // SỬA: Lấy đầy đủ hàm từ useLuckyDraw thay vì gọi trực tiếp drawApi
  const { 
    luckyDraws, 
    winners, 
    fetchAllDraws, 
    fetchWinners, 
    createDraw, 
    updateDraw, 
    deleteDraw,
    loading: contextLoading 
  } = useLuckyDraw();

  // --- STATES ---
  const [activeTab, setActiveTab] = useState('Chiến dịch vòng quay');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [startTimeOnly, setStartTimeOnly] = useState("08:00"); 
  const [endTimeOnly, setEndTimeOnly] = useState("22:00"); 

  const [formData, setFormData] = useState({
    eventId: "",
    title: "",
    description: "",
    status: "PENDING",
    allowMultipleWins: false,
    prizes: [{ name: "", quantity: 1, winProbabilityPercent: 0 }]
  });

  // --- FETCHING LOGIC ---
  useEffect(() => {
    if (activeTab === 'Chiến dịch vòng quay') {
      fetchAllDraws();
    } else {
      fetchWinners();
    }
  }, [activeTab, fetchAllDraws, fetchWinners]);

  // --- EVENT INITIALIZATION FROM URL ---
  useEffect(() => {
    const initFromUrl = async () => {
      if (eventIdFromUrl) {
        try {
          const res = await eventService.getEventById(eventIdFromUrl);
          const eventData = res.data || res; // Linh hoạt tùy cấu trúc res
          setEventDetails(eventData);

          if (eventData.startTime) {
            // SỬA: Xử lý Date an toàn hơn
            const dateStr = Array.isArray(eventData.startTime) 
              ? new Date(eventData.startTime[0], eventData.startTime[1]-1, eventData.startTime[2])
              : new Date(eventData.startTime);
            setSelectedDate(dateStr.toISOString().split('T')[0]);
          }

          setFormData(prev => ({ 
            ...prev, 
            eventId: eventIdFromUrl, 
            title: eventTitleFromUrl ? `Vòng quay: ${eventTitleFromUrl}` : "" 
          }));
          
          setIsCreateModalOpen(true);
          setIsEditMode(false);
          // Dọn dẹp URL sau khi init
          setTimeout(() => setSearchParams({}), 1000);
        } catch (error) {
          console.error("Lỗi lấy thông tin sự kiện:", error);
        }
      }
    };
    initFromUrl();
  }, [eventIdFromUrl, eventTitleFromUrl, eventService, setSearchParams]);

  // --- FORM HELPERS ---
  const totalAllocatedPercent = useMemo(() => {
    return formData.prizes.reduce((sum, p) => sum + (parseFloat(p.winProbabilityPercent) || 0), 0);
  }, [formData.prizes]);

  const unluckyPercent = useMemo(() => {
    const remain = 100 - totalAllocatedPercent;
    return remain > 0 ? remain.toFixed(2) : "0.00";
  }, [totalAllocatedPercent]);

  const handlePrizeChange = (index, field, value) => {
    const newPrizes = [...formData.prizes];
    if (field === 'winProbabilityPercent') {
      let val = Math.max(0, parseFloat(value) || 0);
      const otherSum = formData.prizes.reduce((s, p, i) => i !== index ? s + (parseFloat(p.winProbabilityPercent) || 0) : s, 0);
      if (otherSum + val > 100) val = 100 - otherSum;
      newPrizes[index][field] = val;
    } else {
      newPrizes[index][field] = field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value;
    }
    setFormData({ ...formData, prizes: newPrizes });
  };

  const handleEditClick = (campaign) => {
    // SỬA: Lấy từ object campaign truyền vào (campaign trong map chính là item rút gọn)
    const raw = campaign.raw || campaign;
    setIsEditMode(true);
    setEditingId(raw.id);
    
    // Tách chuỗi startTime/endTime an toàn
    if (raw.startTime) {
      setSelectedDate(raw.startTime.split('T')[0]);
      setStartTimeOnly(raw.startTime.split('T')[1].substring(0, 5));
      setEndTimeOnly(raw.endTime.split('T')[1].substring(0, 5));
    }

    setFormData({
      eventId: raw.eventId,
      title: raw.title,
      description: raw.description || "",
      status: raw.status,
      allowMultipleWins: raw.allowMultipleWins,
      // Quy đổi 0.1 -> 10.00%
      prizes: (raw.prizes || []).filter(p => p.name !== "Chúc bạn may mắn lần sau").map(p => ({
        name: p.name,
        quantity: p.quantity,
        winProbabilityPercent: (p.winProbabilityPercent * 100).toFixed(2)
      }))
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Xác nhận xóa chiến dịch này?`)) return;
    try {
      await deleteDraw(id);
    } catch (error) {
      alert("Lỗi khi xóa chiến dịch");
    }
  };

  const handleSubmit = async () => {
    if (!formData.eventId || !formData.title || !selectedDate) return alert("Vui lòng điền đủ thông tin!");
    setLoading(true);
    try {
      const payload = {
        ...formData,
        startTime: `${selectedDate}T${startTimeOnly}:00`,
        endTime: `${selectedDate}T${endTimeOnly}:00`,
        prizes: [
          ...formData.prizes.filter(p => p.name.trim() !== "").map(p => ({ 
            ...p, 
            winProbabilityPercent: (parseFloat(p.winProbabilityPercent) / 100).toFixed(4) 
          })),
          { 
            name: "Chúc bạn may mắn lần sau", 
            quantity: 999999, 
            winProbabilityPercent: (parseFloat(unluckyPercent) / 100).toFixed(4) 
          }
        ]
      };

      if (isEditMode) {
        await updateDraw(editingId, payload);
      } else {
        await createDraw(payload);
      }
      
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu dữ liệu");
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ eventId: "", title: "", description: "", status: "PENDING", allowMultipleWins: false, prizes: [{ name: "", quantity: 1, winProbabilityPercent: 0 }] });
    setSelectedDate(""); 
    setIsEditMode(false); 
    setEditingId(null);
  };

  // --- UI RENDER HELPERS ---
  const formattedCampaigns = useMemo(() => {
    return (luckyDraws || []).map(item => ({
      id: item.id,
      name: item.title,
      eventId: item.eventId,
      // Sửa định dạng hiển thị thời gian
      time: item.startTime ? `${new Date(item.startTime).toLocaleDateString('vi-VN')} ${new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "—",
      status: item.status,
      raw: item
    }));
  }, [luckyDraws]);

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 min-h-screen font-sans text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Lucky Draw Management</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">Quản trị hệ thống vòng quay</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-slate-200">
        {['Chiến dịch vòng quay', 'Danh sách trúng thưởng'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-5 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative cursor-pointer ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full shadow-lg" />}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-8">
        <table className="min-w-full divide-y divide-slate-200 text-center">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
            <tr>
              {activeTab === 'Chiến dịch vòng quay' ? (
                <>
                  <th className="px-6 py-5">ID</th><th className="px-6 py-5 text-left">Tiêu đề</th><th className="px-6 py-5">Sự kiện</th><th className="px-6 py-5">Thời gian</th><th className="px-6 py-5">Trạng thái</th><th className="px-6 py-5">Thao tác</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-5">Thời gian</th><th className="px-6 py-5">Người trúng</th><th className="px-6 py-5">Chiến dịch</th><th className="px-6 py-5">Giải thưởng</th><th className="px-6 py-4 text-center">Claim</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
            {contextLoading ? (
              <tr><td colSpan="6" className="py-20"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
            ) : activeTab === 'Chiến dịch vòng quay' ? (
              formattedCampaigns.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono">{item.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-left">{item.name}</td>
                  <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">{item.eventId?.substring(0,8) || 'N/A'}</span></td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${STATUS_CONFIG[item.status]?.color || 'bg-slate-100'}`}>
                      {STATUS_CONFIG[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={() => handleEditClick(item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            ) : (
              (winners || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs">
                  <td className="px-6 py-4">{new Date(item.drawTime).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.winnerProfileId}</td>
                  <td className="px-6 py-4 uppercase font-black text-slate-400">{item.luckyDraw?.title || 'N/A'}</td>
                  <td className="px-6 py-4 text-indigo-600 font-black">{item.prize?.name}</td>
                  <td className="px-6 py-4">
                    {item.claimed ? 
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-black uppercase justify-center w-full"><CheckCircle2 size={14}/> Đã nhận</span> : 
                      <span className="inline-flex items-center gap-1 text-slate-300 font-black uppercase justify-center w-full"><XCircle size={14}/> Chờ nhận</span>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CẤU HÌNH */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100"><Settings2 size={28} /></div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{isEditMode ? "Cập nhật" : "Thiết lập"} vòng quay</h2>
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1 italic flex items-center gap-1">
                      <Calendar size={10}/> {eventDetails?.title || 'Sự kiện liên kết'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-300 transition-all cursor-pointer"><X /></button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tiêu đề chiến dịch</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-700 transition-all shadow-inner" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nhập tên vòng quay..." />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic">Ngày diễn ra</label>
                    <input type="date" className="w-full px-6 py-4 bg-indigo-50/30 border-2 border-indigo-100 rounded-2xl font-black text-indigo-700 outline-none focus:bg-white" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic">Thời gian</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 shadow-inner">
                        <input type="time" className="w-full p-2 bg-white border-none rounded-xl text-xs font-bold" value={startTimeOnly} onChange={e => setStartTimeOnly(e.target.value)} />
                        <span className="text-slate-300">~</span>
                        <input type="time" className="w-full p-2 bg-white border-none rounded-xl text-xs font-bold" value={endTimeOnly} onChange={e => setEndTimeOnly(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter italic">Quà tặng & Tỉ lệ</h3>
                    <button onClick={() => setFormData(prev => ({ ...prev, prizes: [...prev.prizes, { name: "", quantity: 1, winProbabilityPercent: 0 }] }))} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all uppercase cursor-pointer">
                      + Thêm giải
                    </button>
                  </div>

                  {formData.prizes.map((prize, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input className="flex-1 p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none" placeholder="Tên quà" value={prize.name} onChange={e => handlePrizeChange(idx, 'name', e.target.value)} />
                      <div className="w-20"><input type="number" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-center font-black text-slate-700" value={prize.quantity} onChange={e => handlePrizeChange(idx, 'quantity', e.target.value)} /></div>
                      <div className="w-24 relative">
                        <input type="number" className="w-full p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-center font-black text-indigo-600" value={prize.winProbabilityPercent} onChange={e => handlePrizeChange(idx, 'winProbabilityPercent', e.target.value)} />
                        <span className="absolute -top-2 -right-1 bg-white border border-indigo-200 text-indigo-600 text-[8px] font-black px-1.5 rounded-full">%</span>
                      </div>
                      <button onClick={() => setFormData(p => ({ ...p, prizes: p.prizes.filter((_, idx2) => idx2 !== idx) }))} className="p-4 text-slate-200 hover:text-rose-500 transition-all cursor-pointer"><Trash2 size={20} /></button>
                    </div>
                  ))}

                  <div className="flex gap-4 items-center p-4 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl opacity-60">
                    <div className="flex-1 text-[10px] font-black text-slate-400 px-4 italic uppercase tracking-widest">Tỉ lệ may mắn lần sau:</div>
                    <div className="w-24 py-3 bg-white border-2 border-slate-100 rounded-2xl text-center font-black text-slate-400">{unluckyPercent}%</div>
                    <div className="w-13"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-amber-50/50 rounded-[32px] border-2 border-amber-100/50">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm"><AlertCircle size={24}/></div>
                    <div>
                      <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Cho phép trúng nhiều lần</p>
                      <p className="text-[9px] text-amber-700/60 font-bold uppercase mt-0.5 tracking-tighter">Một User có thể trúng nhiều giải khác nhau</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.allowMultipleWins} onChange={e => setFormData({...formData, allowMultipleWins: e.target.checked})} />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-10 border-t bg-slate-50/80 flex justify-end gap-5">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors cursor-pointer">Đóng</button>
                <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-3 px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 uppercase text-[11px] tracking-widest transition-all cursor-pointer">
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} {isEditMode ? "Lưu thay đổi" : "Khởi tạo ngay"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinnerManagement;