import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Plus, Eye, Edit, Trash2, Gift, Award, 
  Users, Target, X, Settings2, Save, AlertCircle, Loader2, Calendar, Clock, 
  CheckCircle2, XCircle, PlayCircle, Layers, MousePointer2, Trophy, Search
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// IMPORT CONTEXT
import { useAuth } from '../../context/AuthContext';
import { useLuckyDraw } from '../../context/LuckyDrawContext';

const STATUS_CONFIG = {
  PENDING: { label: "Chờ kích hoạt", color: "bg-amber-100 text-amber-600 border-amber-200" },
  ACTIVE: { label: "Đang diễn ra", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-blue-100 text-blue-600 border-blue-200" },
  CANCELLED: { label: "Đã hủy", color: "bg-rose-100 text-rose-600 border-rose-200" },
};

const SpinnerManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { luckyDraws, winners, fetchAllDraws, createDraw, updateDraw, deleteDraw, loading: contextLoading } = useLuckyDraw();

  const [activeTab, setActiveTab] = useState('Vòng quay may mắn'); // Chỉ giữ tab này
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [startTimeOnly, setStartTimeOnly] = useState("08:00"); 
  const [endTimeOnly, setEndTimeOnly] = useState("22:00"); 

  const [formData, setFormData] = useState({
    eventId: "", title: "", description: "", status: "PENDING", allowMultipleWins: false,
    prizes: [{ name: "", quantity: 1, winProbabilityPercent: 0 }]
  });

  useEffect(() => {
    fetchAllDraws();
  }, [fetchAllDraws]);

  const stats = useMemo(() => ({
    total: luckyDraws?.length || 0,
    active: luckyDraws?.filter(d => d.status === "ACTIVE").length || 0,
    completed: luckyDraws?.filter(d => d.status === "COMPLETED").length || 0,
    totalWinners: winners?.length || 0,
    totalPrizes: luckyDraws?.reduce((acc, draw) => acc + (draw.prizes?.length || 0), 0) || 0
  }), [luckyDraws, winners]);

  const unluckyPercent = useMemo(() => {
    const totalAllocated = formData.prizes.reduce((sum, p) => sum + (parseFloat(p.winProbabilityPercent) || 0), 0);
    const remain = 100 - totalAllocated;
    return remain > 0 ? remain.toFixed(2) : "0.00";
  }, [formData.prizes]);

  const handleEditClick = (item) => {
    setIsEditMode(true);
    setEditingId(item.id);
    if (item.startTime) {
      setSelectedDate(item.startTime.split('T')[0]);
      setStartTimeOnly(item.startTime.split('T')[1].substring(0, 5));
      setEndTimeOnly(item.endTime.split('T')[1].substring(0, 5));
    }
    setFormData({
      eventId: item.eventId,
      title: item.title,
      description: item.description || "",
      status: item.status,
      allowMultipleWins: item.allowMultipleWins,
      prizes: (item.prizes || []).filter(p => p.name !== "Chúc bạn may mắn lần sau").map(p => ({
        name: p.name,
        quantity: p.quantity,
        winProbabilityPercent: (p.winProbabilityPercent * 100).toFixed(2)
      }))
    });
    setIsCreateModalOpen(true);
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
          { name: "Chúc bạn may mắn lần sau", quantity: 999999, winProbabilityPercent: (parseFloat(unluckyPercent) / 100).toFixed(4) }
        ]
      };
      if (isEditMode) await updateDraw(editingId, payload);
      else await createDraw(payload);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) { alert("Lỗi lưu dữ liệu"); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({ eventId: "", title: "", description: "", status: "PENDING", allowMultipleWins: false, prizes: [{ name: "", quantity: 1, winProbabilityPercent: 0 }] });
    setSelectedDate(""); setIsEditMode(false); setEditingId(null);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-left">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <MousePointer2 size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Lucky Draw Management</h1>
        </div>
        <button 
          onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
        >
          <Plus size={18} /> Tạo vòng quay mới
        </button>
      </div>

      {/* STATISTICS CARDS (Giữ nguyên 5 cột như cũ) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 text-white">
        <div className="bg-indigo-600 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Layers size={28} />
            <div>
              <p className="text-sm opacity-90">Tổng chiến dịch</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <PlayCircle size={28} />
            <div>
              <p className="text-sm opacity-90">Đang diễn ra</p>
              <p className="text-3xl font-bold mt-1">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-500 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div>
              <p className="text-sm opacity-90">Đã kết thúc</p>
              <p className="text-3xl font-bold mt-1">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-500 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Trophy size={28} />
            <div>
              <p className="text-sm opacity-90">Lượt trúng giải</p>
              <p className="text-3xl font-bold mt-1">{stats.totalWinners}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-700 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <Gift size={28} />
            <div>
              <p className="text-sm opacity-90">Cơ cấu quà</p>
              <p className="text-3xl font-bold mt-1">{stats.totalPrizes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS (Chỉ còn 1 tab "Vòng quay may mắn") */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto pb-1 gap-2">
        <button
          className="flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 border-indigo-600 text-indigo-600 transition-all"
        >
          <Target size={16} /> Vòng quay may mắn
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-600">
            {stats.total}
          </span>
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {contextLoading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Tên chiến dịch</th>
                  <th className="p-4 text-center font-semibold text-gray-600">Mã sự kiện</th>
                  <th className="p-4 font-semibold text-gray-600">Thời gian</th>
                  <th className="p-4 text-center font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 text-center font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {luckyDraws.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {item.id.substring(0,8)}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">{item.eventId}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-xs text-slate-600">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(item.startTime).toLocaleDateString('vi-VN')}</span>
                        <span className="flex items-center gap-1 opacity-60"><Clock size={12}/> {new Date(item.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_CONFIG[item.status]?.color}`}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(item)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><Edit size={16}/></button>
                        <button onClick={() => deleteDraw(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CONFIG (Giữ nguyên logic form đã tối ưu bo góc) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            {/* ... Nội dung Modal giữ nguyên như code cũ của bạn vì nó đã đẹp và đúng logic ... */}
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white flex flex-col max-h-[90vh]">
               <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Settings2 size={20} /></div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight italic">{isEditMode ? "Cập nhật vòng quay" : "Khởi tạo vòng quay"}</h3>
                  </div>
                  <X onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 cursor-pointer hover:text-rose-500 transition-all" size={20} />
               </div>
               
               <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block tracking-widest">Tiêu đề chiến dịch</label>
                    <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Lucky Draw TechDay 2026" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block tracking-widest">Sự kiện ID</label>
                      <input className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700" value={formData.eventId} onChange={e => setFormData({...formData, eventId: e.target.value})} placeholder="ID sự kiện liên kết" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block tracking-widest">Ngày diễn ra</label>
                      <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-indigo-700 outline-none" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cơ cấu quà tặng ({formData.prizes.length})</p>
                      <button onClick={() => setFormData(prev => ({ ...prev, prizes: [...prev.prizes, { name: "", quantity: 1, winProbabilityPercent: 0, description: "" }] }))} className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1"><Plus size={12} /> Thêm giải</button>
                    </div>
                    {formData.prizes.map((prize, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-3 relative group">
                        <div className="flex gap-3 items-center">
                          <input className="flex-1 px-4 py-2.5 bg-white border border-transparent rounded-xl text-xs font-bold outline-none shadow-sm" placeholder="Tên quà tặng..." value={prize.name} onChange={e => handlePrizeChange(idx, 'name', e.target.value)} />
                          <div className="w-24 relative">
                            <input type="number" className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-center font-black text-indigo-600 text-xs" value={prize.winProbabilityPercent} onChange={e => handlePrizeChange(idx, 'winProbabilityPercent', e.target.value)} />
                            <span className="absolute -top-2 -right-1 bg-white border border-indigo-200 text-indigo-600 text-[8px] font-black px-1.5 rounded-full">%</span>
                          </div>
                          {formData.prizes.length > 1 && <button onClick={() => setFormData(p => ({ ...p, prizes: p.prizes.filter((_, i) => i !== idx) }))} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                      <span className="text-[10px] font-black text-slate-400 uppercase italic">Tỉ lệ rớt giải ("May mắn lần sau"):</span>
                      <span className="text-sm font-black text-slate-500">{unluckyPercent}%</span>
                    </div>
                  </div>
               </div>

               <div className="p-8 border-t bg-slate-50/80 flex justify-end gap-3">
                  <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 font-black text-slate-400 uppercase text-[10px] tracking-widest">Hủy bỏ</button>
                  <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 uppercase text-[11px] tracking-widest transition-all">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                    {isEditMode ? "Cập nhật" : "Lưu chiến dịch"}
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