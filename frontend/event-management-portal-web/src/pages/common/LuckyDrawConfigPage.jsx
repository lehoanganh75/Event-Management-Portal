import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Gift, ArrowLeft, Plus, Trash2, Save, Loader2,
  Info, Trophy, Users, Sparkles, CheckCircle2, AlertCircle, Settings2, Wand2
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
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour, minute] = dateValue;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
      if (typeof dateValue === 'string') return dateValue.slice(0, 16);
      return new Date(dateValue).toISOString().slice(0, 16);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [checkedInCount, setCheckedInCount] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "PENDING",
    allowMultipleWins: false,
    startTime: "",
    endTime: "",
    prizes: [
      { id: Date.now(), name: "Giải đặc biệt", quantity: 1, description: "" }
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
                description: p.description || ""
              }))
          });
        } else {
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

  const handleAiFill = () => {
    setIsAiGenerating(true);

    // Simulate AI thinking
    setTimeout(() => {
      const eventTitle = (event?.title || "").toLowerCase();
      let suggestedPrizes = [];

      if (eventTitle.includes('tech') || eventTitle.includes('công nghệ') || eventTitle.includes('it')) {
        suggestedPrizes = [
          { id: Date.now() + 1, name: "Giải Nhất: Bàn phím cơ Custom", quantity: 1, description: "Bàn phím cơ học cao cấp cho lập trình viên" },
          { id: Date.now() + 2, name: "Giải Nhì: Chuột không dây Logitech", quantity: 2, description: "Chuột Gaming chính xác cao" },
          { id: Date.now() + 3, name: "Giải Ba: Voucher Khóa học AWS", quantity: 5, description: "Voucher giảm 50% khóa học Cloud" }
        ];
      } else if (eventTitle.includes('gala') || eventTitle.includes('tiệc') || eventTitle.includes('dinner')) {
        suggestedPrizes = [
          { id: Date.now() + 1, name: "Giải Đặc Biệt: Tour du lịch Phú Quốc", quantity: 1, description: "Chuyến du lịch 3 ngày 2 đêm cho 2 người" },
          { id: Date.now() + 2, name: "Giải Vàng: Robot hút bụi Xiaomi", quantity: 2, description: "Thiết bị nhà thông minh thế hệ mới" },
          { id: Date.now() + 3, name: "Giải May Mắn: Thẻ quà tặng VinID", quantity: 10, description: "Thẻ nạp trị giá 500,000 VNĐ" }
        ];
      } else if (eventTitle.includes('workshop') || eventTitle.includes('hội thảo') || eventTitle.includes('học')) {
        suggestedPrizes = [
          { id: Date.now() + 1, name: "Giải Kiến Thức: Bộ sách kỹ năng chuyên sâu", quantity: 1, description: "Bộ 5 cuốn sách best-seller về chuyên môn" },
          { id: Date.now() + 2, name: "Giải Sáng Tạo: Máy đọc sách Kindle", quantity: 1, description: "Kindle Paperwhite đời mới nhất" },
          { id: Date.now() + 3, name: "Giải Khuyến Khích: Sổ tay & Bút ký cao cấp", quantity: 5, description: "Bộ quà tặng lưu niệm Workshop" }
        ];
      } else {
        suggestedPrizes = [
          { id: Date.now() + 1, name: "Giải Nhất", quantity: 1, description: "Phần quà giá trị nhất của chương trình" },
          { id: Date.now() + 2, name: "Giải Nhì", quantity: 2, description: "Phần quà hấp dẫn dành cho người may mắn" },
          { id: Date.now() + 3, name: "Giải Ba", quantity: 3, description: "Quà tặng lưu niệm ý nghĩa" }
        ];
      }

      setFormData(prev => ({
        ...prev,
        description: `Chương trình bốc thăm may mắn dành cho khách tham dự sự kiện ${event?.title}. Chúc các bạn may mắn!`,
        prizes: suggestedPrizes
      }));

      setIsAiGenerating(false);
      toast.info("AI đã đề xuất giải thưởng dựa trên chủ đề sự kiện!");
    }, 1200);
  };

  const handleAddPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { id: Date.now(), name: "", quantity: 1, description: "" }]
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

  const totalPrizes = formData.prizes.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);

  const handleSave = async () => {
    if (!formData.title) return toast.error("Vui lòng nhập tiêu đề");
    if (formData.prizes.length === 0) return toast.error("Vui lòng thêm ít nhất một giải thưởng");

    setSaving(true);
    try {
      const payload = {
        ...formData,
        eventId: id,
        prizes: formData.prizes.map(p => ({
          name: p.name,
          quantity: p.quantity,
          description: p.description
        }))
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
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang đồng bộ...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-10 font-sans text-left">
      {/* Compact Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200"
            >
              <ArrowLeft size={14} /> Quay lại
            </motion.button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">Cấu hình Lucky Draw</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sự kiện: {event?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Users size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{checkedInCount} Đã Check-in</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Lưu cấu hình
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Settings2 size={14} className="text-indigo-600" /> Cấu hình chung
              </h3>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAiFill}
                disabled={isAiGenerating}
                className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200"
              >
                {isAiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                AI Magic Fill
              </motion.button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tiêu đề vòng quay</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:bg-white focus:border-indigo-500 transition-all text-xs"
                  placeholder="Nhập tiêu đề..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 focus:bg-white focus:border-indigo-500 transition-all min-h-[80px] text-[11px]"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về vòng quay..."
                />
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian áp dụng</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Bắt đầu</span>
                    <input
                      type="datetime-local"
                      className="w-full bg-white border border-slate-200 px-2 py-2 rounded-lg font-bold text-slate-700 outline-none text-[10px]"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Kết thúc</span>
                    <input
                      type="datetime-local"
                      className="w-full bg-white border border-slate-200 px-2 py-2 rounded-lg font-bold text-slate-700 outline-none text-[10px]"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, allowMultipleWins: !formData.allowMultipleWins })}
                className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${formData.allowMultipleWins ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Trúng nhiều giải</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-all border ${formData.allowMultipleWins ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-300'}`}>
                  <div className={`absolute top-0.5 bg-white w-2.5 h-2.5 rounded-full transition-all ${formData.allowMultipleWins ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[1.5rem] p-6 shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-300" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">Chế độ: Đua Vịt LIVE</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
                <div>
                  <p className="text-2xl font-black">{totalPrizes}</p>
                  <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Tổng số giải</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-200">{checkedInCount}</p>
                  <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Người tham gia</p>
                </div>
              </div>
              <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">"Chế độ Chắc chắn trúng đang bật."</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-200">
                  <Gift size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Cơ cấu giải thưởng</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddPrize}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest"
              >
                <Plus size={14} /> Thêm giải
              </motion.button>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode='popLayout'>
                {formData.prizes.map((prize, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={prize.id}
                    className="group bg-[#F8FAFC] rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề giải</label>
                          <input
                            className="w-full bg-transparent border-b border-slate-200 py-1 font-black text-slate-800 text-base outline-none focus:border-indigo-500"
                            value={prize.name}
                            placeholder="Giải đặc biệt..."
                            onChange={e => handlePrizeChange(prize.id, 'name', e.target.value)}
                          />
                        </div>
                        <input
                          className="w-full bg-transparent border-b border-slate-100 py-1 text-[11px] font-medium text-slate-500 outline-none"
                          value={prize.description}
                          placeholder="Mô tả quà tặng..."
                          onChange={e => handlePrizeChange(prize.id, 'description', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <div className="bg-white rounded-xl p-2 border border-slate-200 text-center">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Số lượng</label>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handlePrizeChange(prize.id, 'quantity', Math.max(1, (prize.quantity || 0) - 1))}
                              className="w-6 h-6 rounded bg-slate-50 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center font-bold border border-slate-200 text-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-black text-sm text-indigo-600">{prize.quantity}</span>
                            <button
                              onClick={() => handlePrizeChange(prize.id, 'quantity', (prize.quantity || 0) + 1)}
                              className="w-6 h-6 rounded bg-slate-50 text-slate-400 hover:text-emerald-50 transition-all flex items-center justify-center font-bold border border-slate-200 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemovePrize(prize.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPrizes > checkedInCount && checkedInCount > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-4">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800/80 text-[11px] font-bold leading-tight">
                  Cảnh báo: {totalPrizes} giải nhưng chỉ có {checkedInCount} người tham gia. Hãy bật "Trúng nhiều giải" hoặc giảm số lượng quà.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyDrawConfigPage;
