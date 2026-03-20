import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Eye, Edit, Trash2, Gift, Award, 
  Users, Target, X, Settings2, Save, AlertCircle, Loader2, Calendar, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getEventById } from "../../api/eventApi";

// Cấu hình hiển thị trạng thái vòng quay
const STATUS_CONFIG = {
  PENDING: { label: "Chờ kích hoạt", color: "bg-amber-100 text-amber-600 border-amber-200" },
  ACTIVE: { label: "Đang diễn ra", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-blue-100 text-blue-600 border-blue-200" },
  CANCELLED: { label: "Đã hủy", color: "bg-rose-100 text-rose-600 border-rose-200" },
};

const SpinnerManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const eventTitleFromUrl = searchParams.get("title");

  // --- States dữ liệu ---
  const [campaigns, setCampaigns] = useState([]);
  const [winners, setWinners] = useState([]); // Dữ liệu từ DrawResult
  const [activeTab, setActiveTab] = useState('Chiến dịch vòng quay');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [fetching, setFetching] = useState(true); 
  const [eventDetails, setEventDetails] = useState(null);

  // --- States Chỉnh sửa ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- States Thời gian rời ---
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

  // 1. Fetch danh sách chiến dịch
  const fetchCampaigns = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8083/api/lucky-draws", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formattedData = res.data.map(item => ({
        id: item.id,
        name: item.title,
        eventId: item.eventId,
        time: `${new Date(item.startTime).toLocaleDateString()} (${new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`,
        status: item.status,
        raw: item
      }));
      setCampaigns(formattedData);
    } catch (error) { console.error("Lỗi tải danh sách:", error); } 
    finally { setFetching(false); }
  };

  // 2. Fetch danh sách trúng thưởng (DrawResult)
  const fetchWinners = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8083/api/draw-results", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWinners(res.data);
    } catch (error) { console.error("Lỗi tải danh sách trúng thưởng:", error); }
    finally { setFetching(false); }
  };

  useEffect(() => {
    if (activeTab === 'Chiến dịch vòng quay') fetchCampaigns();
    if (activeTab === 'Danh sách trúng thưởng') fetchWinners();
  }, [activeTab]);

  // 3. Xử lý khi nhấn Edit
  const handleEditClick = (campaign) => {
    const raw = campaign.raw;
    setIsEditMode(true);
    setEditingId(raw.id);
    
    if (raw.startTime) {
      const start = new Date(raw.startTime);
      const end = new Date(raw.endTime);
      setSelectedDate(raw.startTime.split('T')[0]);
      setStartTimeOnly(start.toTimeString().substring(0, 5));
      setEndTimeOnly(end.toTimeString().substring(0, 5));
    }

    setFormData({
      eventId: raw.eventId,
      title: raw.title,
      description: raw.description || "",
      status: raw.status,
      allowMultipleWins: raw.allowMultipleWins,
      prizes: raw.prizes.filter(p => p.name !== "Chúc bạn may mắn lần sau").map(p => ({
        name: p.name,
        quantity: p.quantity,
        winProbabilityPercent: (p.winProbabilityPercent * 100).toFixed(2)
      }))
    });
    setIsCreateModalOpen(true);
  };

  // 4. Nhận sự kiện từ URL
  useEffect(() => {
    const fetchEventInfo = async () => {
      if (eventIdFromUrl) {
        try {
          const res = await getEventById(eventIdFromUrl);
          setEventDetails(res.data);
          if (res.data.startTime) {
             const dateStr = Array.isArray(res.data.startTime) 
                ? `${res.data.startTime[0]}-${String(res.data.startTime[1]).padStart(2, '0')}-${String(res.data.startTime[2]).padStart(2, '0')}`
                : res.data.startTime.split('T')[0];
             setSelectedDate(dateStr);
          }
          setFormData(prev => ({ ...prev, eventId: eventIdFromUrl, title: eventTitleFromUrl ? `Vòng quay: ${eventTitleFromUrl}` : "" }));
          setIsCreateModalOpen(true);
          setIsEditMode(false);
          setTimeout(() => setSearchParams({}), 1000);
        } catch (error) { console.error(error); }
      }
    };
    fetchEventInfo();
  }, [eventIdFromUrl, eventTitleFromUrl, setSearchParams]);

  // 5. Logic tính tỷ lệ %
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
      let val = parseFloat(value) || 0;
      const otherSum = formData.prizes.reduce((s, p, i) => i !== index ? s + (parseFloat(p.winProbabilityPercent) || 0) : s, 0);
      if (otherSum + val > 100) val = 100 - otherSum;
      newPrizes[index][field] = val;
    } else {
      newPrizes[index][field] = field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value;
    }
    setFormData({ ...formData, prizes: newPrizes });
  };

  const addPrize = () => {
    if (totalAllocatedPercent >= 100) return alert("Đã đạt giới hạn 100%!");
    setFormData(p => ({ ...p, prizes: [...p.prizes, { name: "", quantity: 1, winProbabilityPercent: 0 }] }));
  };

  const removePrize = (i) => {
    if (formData.prizes.length > 1) setFormData(p => ({ ...p, prizes: p.prizes.filter((_, idx) => idx !== i) }));
  };

  // 6. Submit
  const handleSubmit = async () => {
    if (!formData.eventId || !formData.title || !selectedDate) return alert("Vui lòng điền đủ thông tin!");
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        ...formData,
        startTime: `${selectedDate}T${startTimeOnly}:00`,
        endTime: `${selectedDate}T${endTimeOnly}:00`,
        prizes: [
          ...formData.prizes.filter(p => p.name.trim() !== "").map(p => ({ ...p, winProbabilityPercent: (p.winProbabilityPercent / 100).toFixed(4) })),
          { name: "Chúc bạn may mắn lần sau", quantity: 999999, winProbabilityPercent: (parseFloat(unluckyPercent) / 100).toFixed(4) }
        ]
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8083/api/lucky-draws/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post("http://localhost:8083/api/lucky-draws", payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (err) { alert("Lỗi xử lý!"); } 
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ eventId: "", title: "", description: "", status: "PENDING", allowMultipleWins: false, prizes: [{ name: "", quantity: 1, winProbabilityPercent: 0 }] });
    setSelectedDate(""); setStartTimeOnly("08:00"); setEndTimeOnly("22:00"); setIsEditMode(false); setEditingId(null);
  };

  return (
    <div className="space-y-8 p-8 bg-slate-50/50 min-h-screen font-sans animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Spin Board</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">Lucky Draw Management System</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-10 border-b border-slate-200">
        {['Chiến dịch vòng quay', 'Danh sách trúng thưởng'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-5 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full shadow-lg" />}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <table className="min-w-full divide-y divide-slate-200 text-center">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
            <tr>
              {activeTab === 'Chiến dịch vòng quay' ? (
                <>
                  <th className="px-6 py-5">ID</th><th className="px-6 py-5">Tiêu đề</th><th className="px-6 py-5">Sự kiện</th><th className="px-6 py-5">Thời gian</th><th className="px-6 py-5">Trạng thái</th><th className="px-6 py-5">Thao tác</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-5">Thời gian</th><th className="px-6 py-5">Người trúng (ID)</th><th className="px-6 py-5">Chiến dịch</th><th className="px-6 py-5">Giải thưởng</th><th className="px-6 py-5">Nhận giải</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
            {fetching ? (
              <tr><td colSpan="6" className="py-20"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
            ) : activeTab === 'Chiến dịch vòng quay' ? (
              campaigns.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-slate-400 text-xs">{item.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-left">{item.name}</td>
                  <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{item.eventId}</span></td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${STATUS_CONFIG[item.status]?.color}`}>
                      {STATUS_CONFIG[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={() => handleEditClick(item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit size={16}/></button>
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            ) : (
              winners.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-xs">{new Date(item.drawTime).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.winnerProfileId}</td>
                  <td className="px-6 py-4 text-xs uppercase">{item.luckyDraw?.title}</td>
                  <td className="px-6 py-4 text-indigo-600 font-bold">{item.prize?.name}</td>
                  <td className="px-6 py-4">
                    {item.claimed ? 
                      <span className="flex items-center justify-center gap-1 text-emerald-500"><CheckCircle2 size={14}/> Đã nhận</span> : 
                      <span className="flex items-center justify-center gap-1 text-slate-300"><XCircle size={14}/> Chưa nhận</span>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CẤU HÌNH */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100"><Settings2 size={28} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter text-left">{isEditMode ? "Cập nhật" : "Thiết lập"} vòng quay</h2>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1 italic flex items-center gap-1">
                    <Calendar size={10}/> {eventDetails?.title || formData.eventId || 'Vui lòng chọn sự kiện'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-300 transition-all"><X /></button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tiêu đề chương trình</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all shadow-inner" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

                {isEditMode && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Trạng thái vận hành</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-slate-700" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic">Ngày diễn ra</label>
                    <div className="relative">
                       <Calendar className="absolute left-4 top-4 text-indigo-500" size={20}/>
                       <input type="date" className="w-full pl-12 pr-6 py-4 bg-indigo-50/30 border-2 border-indigo-100 rounded-2xl font-black text-indigo-700 outline-none focus:bg-white" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block italic">Khoảng giờ</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 shadow-inner">
                        <input type="time" className="w-full p-2 bg-white border rounded-xl text-xs font-bold" value={startTimeOnly} onChange={e => setStartTimeOnly(e.target.value)} />
                        <span className="text-slate-300">~</span>
                        <input type="time" className="w-full p-2 bg-white border rounded-xl text-xs font-bold" value={endTimeOnly} onChange={e => setEndTimeOnly(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Cơ cấu giải thưởng</h3>
                    <button onClick={addPrize} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-600 transition-all uppercase">
                      <Plus size={14} /> Thêm giải
                    </button>
                  </div>

                  {formData.prizes.map((prize, idx) => (
                    <div key={idx} className="flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
                      <input className="flex-1 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-400 rounded-2xl text-sm font-bold text-slate-700 outline-none" placeholder="Tên quà" value={prize.name} onChange={e => handlePrizeChange(idx, 'name', e.target.value)} />
                      <div className="w-20"><input type="number" className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-center font-black text-slate-700 outline-none" placeholder="SL" value={prize.quantity} onChange={e => handlePrizeChange(idx, 'quantity', e.target.value)} /></div>
                      <div className="w-24 relative">
                        <input type="number" step="0.01" className="w-full p-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl text-center font-black text-indigo-600 outline-none" placeholder="%" value={prize.winProbabilityPercent} onChange={e => handlePrizeChange(idx, 'winProbabilityPercent', e.target.value)} />
                        <span className="absolute -top-2 -right-1 bg-white border border-indigo-200 text-indigo-600 text-[8px] font-black px-1.5 rounded-full shadow-sm">%</span>
                      </div>
                      <button onClick={() => removePrize(idx)} className="p-4 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
                    </div>
                  ))}

                  <div className="flex gap-4 items-center p-4 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl opacity-60 italic text-left">
                    <div className="flex-1 text-[11px] font-bold text-slate-400 px-4 italic">Tỷ lệ bù "May mắn lần sau":</div>
                    <div className="w-24 py-3 bg-white border-2 border-slate-100 rounded-2xl text-center font-black text-slate-400">{unluckyPercent}%</div>
                    <div className="w-13"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t bg-slate-50/80 flex justify-end gap-5">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-8 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600">Đóng</button>
              <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-3 px-12 py-4 bg-indigo-600 text-white font-black rounded-[20px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 uppercase text-[11px] tracking-[0.2em] transition-all">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} {isEditMode ? "Lưu thay đổi" : "Lưu cấu hình"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinnerManagement;