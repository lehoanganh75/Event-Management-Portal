import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Gift, ArrowLeft, Plus, Trash2, Save, Loader2, Sparkles, 
  Info, CheckCircle, Calculator, Users, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import eventService from '../../services/eventService';
import luckyDrawService from '../../services/luckyDrawService';
import { toast } from 'react-toastify';

const LuckyDrawConfigPage = ({ userType = 'admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const formatDateTimeForInput = (dateValue) => {
    if (!dateValue) return "";
    try {
      // Nếu là mảng (LocalDateTime từ Jackson)
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour, minute] = dateValue;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
      // Nếu là string
      if (typeof dateValue === 'string') {
        return dateValue.slice(0, 16);
      }
      // Các trường hợp khác (Date object, v.v.)
      return new Date(dateValue).toISOString().slice(0, 16);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkedInCount, setCheckedInCount] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "PENDING",
    allowMultipleWins: false,
    startTime: "",
    endTime: "",
    prizes: [
      { id: Date.now(), name: "Giải đặc biệt", quantity: 1, winProbabilityPercent: 0, description: "" }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, drawRes] = await Promise.all([
          eventService.getEventById(id),
          luckyDrawService.findLuckyDrawByEventId(id).catch(() => ({ data: null }))
        ]);

        const eventData = eventRes.data;
        setEvent(eventData);
        
        // Tính số lượng checkin
        const checkinCount = eventData.registrations?.filter(r => r.checkedIn === true).length || 0;
        setCheckedInCount(checkinCount);

        if (drawRes && drawRes.data && drawRes.data.luckyDraw) {
          const draw = drawRes.data.luckyDraw;
          setFormData({
            id: draw.id,
            title: draw.title,
            description: draw.description || "",
            status: draw.status,
            allowMultipleWins: draw.allowMultipleWins,
            startTime: formatDateTimeForInput(draw.startTime),
            endTime: formatDateTimeForInput(draw.endTime),
            prizes: (draw.prizes || [])
              .filter(p => p.name !== "Chúc bạn may mắn lần sau")
              .map(p => ({
                id: p.id || Math.random(),
                name: p.name,
                quantity: p.quantity,
                winProbabilityPercent: (p.winProbabilityPercent * 100).toFixed(2),
                description: p.description || ""
              }))
          });
        } else {
          // Default title if new
          setFormData(prev => ({
            ...prev,
            title: `Lucky Draw: ${eventData.title}`,
            startTime: formatDateTimeForInput(eventData.startTime),
            endTime: formatDateTimeForInput(eventData.endTime),
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải thông tin cấu hình");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { id: Date.now(), name: "", quantity: 1, winProbabilityPercent: 0, description: "" }]
    }));
  };

  const handleRemovePrize = (id) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter(p => p.id !== id)
    }));
  };

  const handlePrizeChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const calculateRatesAutomatically = () => {
    if (checkedInCount === 0) {
      toast.warning("Chưa có thành viên check-in thành công để tính tỉ lệ!");
      return;
    }

    const updatedPrizes = formData.prizes.map(p => {
      const rate = ((p.quantity / checkedInCount) * 100).toFixed(2);
      return { ...p, winProbabilityPercent: rate };
    });

    setFormData(prev => ({ ...prev, prizes: updatedPrizes }));
    toast.success("Đã cập nhật tỉ lệ dựa trên số lượng check-in!");
  };

  const unluckyPercent = useMemo(() => {
    const totalAllocated = formData.prizes.reduce((sum, p) => sum + (parseFloat(p.winProbabilityPercent) || 0), 0);
    const remain = 100 - totalAllocated;
    return remain > 0 ? remain.toFixed(2) : "0.00";
  }, [formData.prizes]);

  const handleSave = async () => {
    if (!formData.title) return toast.error("Vui lòng nhập tiêu đề");
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        eventId: id,
        prizes: [
          ...formData.prizes.map(p => ({
            name: p.name,
            quantity: p.quantity,
            description: p.description,
            winProbabilityPercent: (parseFloat(p.winProbabilityPercent) / 100).toFixed(4)
          })),
          { 
            name: "Chúc bạn may mắn lần sau", 
            quantity: 999999, 
            winProbabilityPercent: (parseFloat(unluckyPercent) / 100).toFixed(4),
            description: "Cảm ơn bạn đã tham gia!"
          }
        ]
      };

      if (formData.id) {
        await luckyDrawService.update(formData.id, payload);
      } else {
        await luckyDrawService.create(payload);
      }
      toast.success("Đã lưu cấu hình vòng quay!");
      navigate(-1);
    } catch (err) {
      toast.error("Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-left">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cấu hình Lucky Draw</h1>
              <p className="text-xs text-slate-500 font-medium">Sự kiện: {event?.title}</p>
            </div>
          </div>
          <button 
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu cấu hình
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={16} className="text-indigo-600" /> Thông tin chung
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Tiêu đề</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-500 transition-all"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Mô tả</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-700 focus:bg-white focus:border-indigo-500 transition-all min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả về chương trình vòng quay..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Bắt đầu</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-indigo-700 outline-none"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Kết thúc</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-indigo-700 outline-none"
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.allowMultipleWins}
                      onChange={e => setFormData({...formData, allowMultipleWins: e.target.checked})}
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.allowMultipleWins ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.allowMultipleWins ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Cho phép trúng nhiều giải</span>
                </label>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-indigo-900 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <Calculator size={120} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Dữ liệu tính toán</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl font-black">{checkedInCount}</p>
                <p className="text-[10px] font-bold uppercase opacity-60">Người tham gia đã Check-in</p>
              </div>
            </div>
            <button 
              onClick={calculateRatesAutomatically}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
            >
              <Calculator size={16} /> Tự động tính tỉ lệ
            </button>
            <p className="text-[9px] text-indigo-300 mt-4 italic text-center leading-relaxed">
              * Tỉ lệ trúng giải sẽ được tính bằng: <br /> (Số lượng sản phẩm / Số người check-in) x 100
            </p>
          </div>
        </div>

        {/* Right Column: Prizes Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Gift size={20} className="text-emerald-500" /> Cơ cấu giải thưởng
                </h3>
                <p className="text-xs text-slate-400 mt-1">Tổng tỉ lệ đã phân bổ: <span className="font-bold text-indigo-600">{ (100 - unluckyPercent).toFixed(2) }%</span></p>
              </div>
              <button 
                onClick={handleAddPrize}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
              >
                <Plus size={16} /> Thêm giải
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode='popLayout'>
                {formData.prizes.map((prize, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={prize.id} 
                    className="group relative bg-slate-50 rounded-3xl p-6 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Name & Description */}
                      <div className="md:col-span-6 space-y-4">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Tên giải</label>
                          <input 
                            className="w-full bg-transparent border-b border-slate-200 py-1 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                            value={prize.name}
                            placeholder="Nhập tên giải..."
                            onChange={e => handlePrizeChange(prize.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Mô tả quà tặng</label>
                          <input 
                            className="w-full bg-transparent border-b border-slate-200 py-1 text-xs text-slate-500 outline-none focus:border-indigo-500 transition-all"
                            value={prize.description}
                            placeholder="Mô tả chi tiết quà tặng..."
                            onChange={e => handlePrizeChange(prize.id, 'description', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1 block">Số lượng</label>
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                          <input 
                            type="number" 
                            className="w-full text-center font-black text-slate-700 outline-none bg-transparent"
                            value={prize.quantity}
                            min="1"
                            onChange={e => handlePrizeChange(prize.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Probability */}
                      <div className="md:col-span-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1 block">Tỉ lệ trúng (%)</label>
                        <div className="flex items-center bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 shadow-sm">
                          <input 
                            type="number" 
                            className="w-full text-center font-black text-indigo-600 outline-none bg-transparent"
                            value={prize.winProbabilityPercent}
                            step="0.01"
                            onChange={e => handlePrizeChange(prize.id, 'winProbabilityPercent', e.target.value)}
                          />
                          <span className="text-indigo-300 font-bold">%</span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-1 flex justify-center pt-5">
                        <button 
                          onClick={() => handleRemovePrize(prize.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* No Prizes Placeholder */}
              {formData.prizes.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Gift size={32} />
                  </div>
                  <p className="text-slate-400 text-sm italic">Chưa có giải thưởng nào. Hãy thêm giải mới ngay!</p>
                </div>
              )}
            </div>

            {/* Consolation Prize Summary */}
            <div className="mt-12 p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                     <Trophy size={24} className="text-amber-400" />
                   </div>
                   <div>
                     <h4 className="font-black text-lg">May mắn lần sau</h4>
                     <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Tỉ lệ rớt giải tự động</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-4xl font-black text-indigo-400">{unluckyPercent}<span className="text-xl">%</span></div>
                   <p className="text-[9px] text-slate-500 mt-1 font-bold italic">Tự động bù đắp để đạt 100% tỉ lệ</p>
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyDrawConfigPage;
