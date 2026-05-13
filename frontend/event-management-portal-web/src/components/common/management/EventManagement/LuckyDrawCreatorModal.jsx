import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Trophy, Plus, Trash2, Send, Info, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import luckyDrawService from "../../../../services/luckyDrawService";

const LuckyDrawCreatorModal = ({ isOpen, onClose, event, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [formData, setFormData] = useState({
    title: `Vòng quay may mắn - ${event?.title || ""}`,
    description: "Tham gia vòng quay may mắn để nhận những phần quà hấp dẫn từ ban tổ chức!",
    startTime: event?.startDate || "",
    endTime: event?.endDate || "",
    prizes: [
      { name: "Giải Nhất", quantity: 1, description: "Phần quà giá trị nhất" }
    ]
  });

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch (e) {
      return "";
    }
  };

  const handleAISuggest = () => {
    setIsSuggesting(true);
    // Giả lập logic AI gợi ý dựa trên tiêu đề sự kiện
    setTimeout(() => {
      const eventTitle = event?.title || "Sự kiện";
      const eventTitleLower = eventTitle.toLowerCase();

      let suggestedTitle = "";
      let suggestedDescription = "";
      let suggestedPrizes = [];

      if (eventTitleLower.includes("công nghệ") || eventTitleLower.includes("tech") || eventTitleLower.includes("it")) {
        suggestedTitle = `Siêu Vòng Quay Công Nghệ - ${eventTitle}`;
        suggestedDescription = `Cơ hội sở hữu các thiết bị Hi-tech cực đỉnh dành riêng cho các tín đồ công nghệ tham gia ${eventTitle}. Đừng bỏ lỡ!`;
        suggestedPrizes = [
          { name: "Chuột Gaming Logitech G502", quantity: 1, description: "Chuột chơi game cao cấp nhất" },
          { name: "Bàn phím cơ Akko 3087", quantity: 2, description: "Bàn phím cơ chuyên nghiệp" },
          { name: "Tai nghe Bluetooth Sony WH-1000XM4", quantity: 3, description: "Tai nghe chống ồn đỉnh cao" }
        ];
      } else if (eventTitleLower.includes("gala") || eventTitleLower.includes("tiệc") || eventTitleLower.includes("kỷ niệm")) {
        suggestedTitle = `Khai Xuân May Mắn - Gala Dinner ${eventTitle}`;
        suggestedDescription = `Chào mừng bạn đến với chương trình bốc thăm may mắn lớn nhất năm. Những phần quà giá trị đang chờ đợi chủ nhân xứng đáng nhất!`;
        suggestedPrizes = [
          { name: "Voucher nghỉ dưỡng 5 sao Phú Quốc", quantity: 1, description: "Kỳ nghỉ 3 ngày 2 đêm cho 2 người" },
          { name: "Thẻ quà tặng VinID 1.000.000đ", quantity: 5, description: "Mua sắm thả ga trên toàn hệ thống" },
          { name: "Bộ ấm trà gốm sứ cao cấp", quantity: 10, description: "Quà tặng lưu niệm sang trọng" }
        ];
      } else {
        suggestedTitle = `Vòng Quay May Mắn: ${eventTitle}`;
        suggestedDescription = `Chương trình tri ân đặc biệt dành cho tất cả thành viên tham gia sự kiện. Hãy cùng thử vận may để nhận về những phần quà hấp dẫn!`;
        suggestedPrizes = [
          { name: "Giải đặc biệt: 2.000.000đ Tiền mặt", quantity: 1, description: "Phần thưởng giá trị nhất chương trình" },
          { name: "Thẻ cào điện thoại 500.000đ", quantity: 5, description: "Nạp tiền ngay cho mọi nhà mạng" },
          { name: "Bộ quà tặng lưu niệm độc quyền", quantity: 10, description: "Gồm sổ tay, bút và gấu bông sự kiện" }
        ];
      }

      console.log("Event Data passed to Modal:", event);

      const start = event?.startDate || event?.startTime;
      const end = event?.endDate || event?.endTime;

      setFormData(prev => ({
        ...prev,
        title: suggestedTitle,
        description: suggestedDescription,
        startTime: formatDateTime(start) || prev.startTime,
        endTime: formatDateTime(end) || prev.endTime,
        prizes: suggestedPrizes
      }));

      setIsSuggesting(false);
      toast.info("AI đã điền đầy đủ thông tin gợi ý cho chương trình!");
    }, 800);
  };

  const handleAddPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { name: "", quantity: 1, description: "" }]
    }));
  };

  const handleRemovePrize = (index) => {
    if (formData.prizes.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const handlePrizeChange = (index, field, value) => {
    const newPrizes = [...formData.prizes];
    newPrizes[index][field] = value;
    setFormData(prev => ({ ...prev, prizes: newPrizes }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Vui lòng nhập tiêu đề");
    if (!formData.startTime || !formData.endTime) return toast.error("Vui lòng nhập thời gian bắt đầu và kết thúc");
    if (formData.prizes.some(p => !p.name.trim())) return toast.error("Vui lòng nhập tên tất cả các giải thưởng");

    setIsCreating(true);
    try {
      await luckyDrawService.create({
        ...formData,
        eventId: event.id,
        status: "PENDING"
      });
      toast.success("Khởi tạo chương trình vòng quay thành công!");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Lỗi khởi tạo vòng quay:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40"
          />

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
          >
            {/* Header - Simple & Clean */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Gift size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Thiết lập Vòng quay</h2>
                  <p className="text-xs text-slate-400 font-medium tracking-tight">Tạo chương trình bốc thăm cho sự kiện</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Tiêu đề chương trình <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiêu đề chương trình..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Bắt đầu</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-700"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kết thúc</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-700"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mô tả chương trình</label>
                  <textarea
                    placeholder="Nhập mô tả chi tiết..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-600 min-h-[80px]"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    Cơ cấu giải thưởng
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAISuggest}
                      disabled={isSuggesting}
                      className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all border border-amber-100"
                    >
                      {isSuggesting ? (
                        <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      AI Gợi ý
                    </button>
                    <button
                      type="button"
                      onClick={handleAddPrize}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-all border border-indigo-100"
                    >
                      <Plus size={14} /> Thêm giải
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.prizes.map((prize, index) => (
                    <div key={index} className="p-4 bg-white border border-slate-200 rounded-xl relative group hover:border-indigo-200 transition-all">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-8">
                          <input
                            type="text"
                            placeholder="Tên giải thưởng"
                            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-800"
                            value={prize.name}
                            onChange={e => handlePrizeChange(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min="1"
                            placeholder="SL"
                            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm font-bold text-center text-slate-800"
                            value={prize.quantity}
                            onChange={e => handlePrizeChange(index, "quantity", parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePrize(index)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="col-span-12">
                          <input
                            type="text"
                            placeholder="Mô tả giải thưởng..."
                            className="w-full px-3 py-2.5 bg-slate-50/30 border border-transparent border-b-slate-100 rounded-none focus:border-b-indigo-500 outline-none transition-all text-xs text-slate-500 font-medium"
                            value={prize.description}
                            onChange={e => handlePrizeChange(index, "description", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Khởi tạo ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LuckyDrawCreatorModal;
