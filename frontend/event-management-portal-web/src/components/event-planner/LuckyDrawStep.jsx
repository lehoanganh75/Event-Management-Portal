import React, { useState } from "react";
import {
  Gift,
  Plus,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";

export default function LuckyDrawStep({ formData, setFormData, onNext, onBack }) {
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [prizes, setPrizes] = useState(() => {
    if (formData.prizes && formData.prizes.length > 0) return formData.prizes;
    return [];
  });

  const [isActive, setIsActive] = useState(formData.hasLuckyDraw || false);

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    setFormData({ ...formData, hasLuckyDraw: nextState });
  };

  const aiSuggestions = [
    { name: "iPhone 15 Pro Max", count: 1, description: "Smartphone cao cấp nhất với camera 48MP và chip A17 Pro mạnh mẽ." },
    { name: "Tai nghe Sony WH-1000XM5", count: 2, description: "Tai nghe không dây chống ồn chủ động tốt nhất thế giới hiện nay." },
    { name: "Apple Watch Series 9", count: 3, description: "Đồng hồ thông minh theo dõi sức khỏe và luyện tập chuyên nghiệp." },
    { name: "Loa Bluetooth Marshall", count: 5, description: "Thiết kế retro sang trọng với chất âm đặc trưng của hãng Marshall." },
    { name: "Chuột Gaming Logitech G502", count: 10, description: "Chuột chơi game quốc dân với cảm biến HERO 25K siêu chính xác." },
    { name: "Bàn phím cơ Akko 3068B", count: 5, description: "Bàn phím cơ nhỏ gọn, switch gõ êm ái, hỗ trợ đa kết nối." },
    { name: "Sạc dự phòng Anker 20000mAh", count: 20, description: "Sạc nhanh PowerIQ 2.0, dung lượng lớn, an toàn cho thiết bị." },
    { name: "Voucher IUH Shop 200k", count: 50, description: "Phiếu mua hàng áp dụng cho tất cả sản phẩm tại cửa hàng lưu niệm IUH." },
    { name: "Bình giữ nhiệt Lock&Lock", count: 30, description: "Dung lượng 500ml, giữ nhiệt lên đến 12 giờ, inox 304 cao cấp." },
  ];

  const addPrize = (prize) => {
    const newId = Date.now();
    const updatedPrizes = [...prizes, { ...prize, id: newId }];
    setPrizes(updatedPrizes);
    setFormData({ ...formData, prizes: updatedPrizes });
  };

  const removePrize = (id) => {
    const updatedPrizes = prizes.filter((p) => p.id !== id);
    setPrizes(updatedPrizes);
    setFormData({ ...formData, prizes: updatedPrizes });
  };

  const addManualPrize = () => {
    addPrize({ name: "Giải thưởng mới", count: 1, description: "" });
  };

  const updatePrize = (id, field, value) => {
    const updatedPrizes = prizes.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setPrizes(updatedPrizes);
    setFormData({ ...formData, prizes: updatedPrizes });
  };

  return (
    <div className="w-full mx-auto p-0">
      <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col gap-8">

        {/* HEADER */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Vòng quay may mắn
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cấu hình chương trình rút thăm trúng thưởng cho sự kiện
          </p>
        </div>

        {/* Toggle Activation Box */}
        <div className="flex items-start gap-4 p-5 bg-amber-50/50 border border-amber-100 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Kích hoạt Vòng quay may mắn
              </h3>
              <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                Tạo sự hứng thú và tăng tương tác của người tham gia. Bạn có thể tự định nghĩa hoặc sử dụng AI để gợi ý danh sách quà tặng phù hợp.
              </p>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={handleToggle}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              Sử dụng vòng quay may mắn trong sự kiện này
            </label>
          </div>
        </div>

        {isActive && (
          <div className="space-y-6">

            {/* Cấu hình chi tiết - Bỏ viền bên ngoài */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info size={16} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-850">Cấu hình chi tiết vòng quay</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu đề vòng quay</label>
                  <input
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors"
                    placeholder="VD: Quay số may mắn IUH 2024"
                    value={formData.luckyDrawTitle || ""}
                    onChange={(e) => setFormData({ ...formData, luckyDrawTitle: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 justify-end pb-2">
                  <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      checked={formData.allowMultipleWins || false}
                      onChange={(e) => setFormData({ ...formData, allowMultipleWins: e.target.checked })}
                    />
                    <span>Cho phép một người trúng nhiều giải</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả chương trình</label>
                <textarea
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none resize-none h-20 focus:border-indigo-500 transition-colors"
                  placeholder="Nhập mô tả ngắn gọn về chương trình quay số..."
                  value={formData.luckyDrawDescription || ""}
                  onChange={(e) => setFormData({ ...formData, luckyDrawDescription: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors"
                    value={formData.luckyDrawStartTime || ""}
                    onChange={(e) => setFormData({ ...formData, luckyDrawStartTime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors"
                    value={formData.luckyDrawEndTime || ""}
                    onChange={(e) => setFormData({ ...formData, luckyDrawEndTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Danh sách giải thưởng */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Danh sách giải thưởng</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={addManualPrize}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
                  >
                    <Plus size={14} />
                    Thêm thủ công
                  </button>
                  <button
                    onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors"
                  >
                    <Sparkles size={14} />
                    AI gợi ý
                  </button>
                </div>
              </div>

              {/* AI Suggestions Box */}
              {showAiSuggestions && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold">
                    <Sparkles size={13} />
                    Gợi ý giải thưởng từ AI (quy mô {formData.maxParticipants || 500} người)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                    {aiSuggestions.map((s, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">SL: {s.count} • {s.description}</p>
                        </div>
                        <button
                          onClick={() => addPrize(s)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                        >
                          Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prize Table / List - Modern Sleek design */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold">
                      <th className="px-4 py-3 w-1/3">Tên giải thưởng</th>
                      <th className="px-4 py-3 w-5/12">Mô tả chi tiết</th>
                      <th className="px-4 py-3 text-center w-20">Số lượng</th>
                      <th className="px-4 py-3 text-center w-16">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {prizes.length > 0 ? (
                      prizes.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3">
                            <input
                              className="w-full border-none outline-none text-sm text-slate-800 font-medium bg-transparent focus:bg-slate-50 rounded px-1 py-0.5"
                              value={p.name}
                              onChange={(e) => updatePrize(p.id, 'name', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              className="w-full border border-transparent outline-none text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:border-slate-200 px-2 py-1.5 rounded-lg transition-colors"
                              placeholder="Nhập mô tả giải thưởng..."
                              value={p.description || ""}
                              onChange={(e) => updatePrize(p.id, 'description', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              className="w-16 border border-slate-200 rounded-lg py-1 text-center text-sm font-medium focus:border-indigo-500 focus:outline-none"
                              value={p.count}
                              onChange={(e) => updatePrize(p.id, 'count', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removePrize(p.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400 text-sm">
                          Chưa có giải thưởng nào. Click "AI gợi ý" hoặc thêm thủ công.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
