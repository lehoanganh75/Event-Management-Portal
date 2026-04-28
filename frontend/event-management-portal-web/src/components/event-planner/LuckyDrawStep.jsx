import React, { useState } from "react";
import {
  Gift,
  Plus,
  Trash2,
  Sparkles,
  Info,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

export default function LuckyDrawStep({ formData, setFormData, onNext, onBack }) {
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [prizes, setPrizes] = useState(() => {
    if (formData.prizes && formData.prizes.length > 0) return formData.prizes;
    return [{ id: 'consolation', name: "Chúc bạn may mắn lần sau", count: 999, rate: 100, description: "Cảm ơn bạn đã tham gia, hãy thử lại ở các sự kiện sau nhé!", isDefault: true }];
  });

  const [isActive, setIsActive] = useState(formData.hasLuckyDraw || false);

  const aiSuggestions = [
    { name: "iPhone 15 Pro Max", count: 1, rate: 1, description: "Smartphone cao cấp nhất với camera 48MP và chip A17 Pro mạnh mẽ." },
    { name: "Tai nghe Sony WH-1000XM5", count: 2, rate: 2, description: "Tai nghe không dây chống ồn chủ động tốt nhất thế giới hiện nay." },
    { name: "Apple Watch Series 9", count: 3, rate: 3, description: "Đồng hồ thông minh theo dõi sức khỏe và luyện tập chuyên nghiệp." },
    { name: "Loa Bluetooth Marshall", count: 5, rate: 5, description: "Thiết kế retro sang trọng với chất âm đặc trưng của hãng Marshall." },
    { name: "Chuột Gaming Logitech G502", count: 10, rate: 10, description: "Chuột chơi game quốc dân với cảm biến HERO 25K siêu chính xác." },
    { name: "Bàn phím cơ Akko 3068B", count: 5, rate: 5, description: "Bàn phím cơ nhỏ gọn, switch gõ êm ái, hỗ trợ đa kết nối." },
    { name: "Sạc dự phòng Anker 20000mAh", count: 20, rate: 15, description: "Sạc nhanh PowerIQ 2.0, dung lượng lớn, an toàn cho thiết bị." },
    { name: "Voucher IUH Shop 200k", count: 50, rate: 25, description: "Phiếu mua hàng áp dụng cho tất cả sản phẩm tại cửa hàng lưu niệm IUH." },
    { name: "Bình giữ nhiệt Lock&Lock", count: 30, rate: 15, description: "Dung lượng 500ml, giữ nhiệt lên đến 12 giờ, inox 304 cao cấp." },
  ];

  const calculateConsolationRate = (currentPrizes) => {
    const otherPrizesRate = currentPrizes
      .filter(p => !p.isDefault)
      .reduce((sum, p) => sum + (Number(p.rate) || 0), 0);
    return Math.max(0, 100 - otherPrizesRate);
  };

  const handleToggle = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    setFormData({ ...formData, hasLuckyDraw: newStatus });
  };

  const addPrize = (prize) => {
    const newId = Date.now();
    const newPrizesWithoutDefault = prizes.filter(p => !p.isDefault);
    const updatedPrizes = [...newPrizesWithoutDefault, { ...prize, id: newId }];

    const finalPrizes = [
      ...updatedPrizes,
      { id: 'consolation', name: "Chúc bạn may mắn lần sau", count: 999, rate: calculateConsolationRate(updatedPrizes), isDefault: true }
    ];

    setPrizes(finalPrizes);
    setFormData({ ...formData, prizes: finalPrizes });
  };

  const removePrize = (id) => {
    if (id === 'consolation') return; // Không cho xóa giải mặc định
    const updatedPrizes = prizes.filter((p) => p.id !== id);

    // Cập nhật lại tỷ lệ cho giải mặc định
    const finalPrizes = updatedPrizes.map(p =>
      p.isDefault ? { ...p, rate: calculateConsolationRate(updatedPrizes) } : p
    );

    setPrizes(finalPrizes);
    setFormData({ ...formData, prizes: finalPrizes });
  };

  const addManualPrize = () => {
    addPrize({ name: "Giải thưởng mới", count: 1, rate: 5, description: "" });
  };

  const updatePrize = (id, field, value) => {
    if (id === 'consolation' && field === 'rate') return; // Không cho sửa tỷ lệ giải mặc định thủ công

    const updatedPrizes = prizes.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );

    // Tính toán lại tỷ lệ giải mặc định
    const finalPrizes = updatedPrizes.map(p =>
      p.isDefault ? { ...p, rate: calculateConsolationRate(updatedPrizes) } : p
    );

    setPrizes(finalPrizes);
    setFormData({ ...formData, prizes: finalPrizes });
  };

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Vòng quay may mắn</h2>

        {/* Toggle Activation Box */}
        <div style={{
          background: "#fffbeb",
          border: "1px solid #fef3c7",
          borderRadius: 12,
          padding: "24px",
          display: "flex",
          gap: 20,
          alignItems: "flex-start"
        }}>
          <div style={{
            width: 48,
            height: 48,
            background: "#fef9c3",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d97706"
          }}>
            <Gift size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>Vòng quay may mắn</h3>
            <p style={{ fontSize: 13, color: "#b45309", margin: "0 0 16px", lineHeight: 1.5 }}>
              Tăng tương tác và tạo sự hứng thú cho người tham dự với vòng quay may mắn. AI sẽ gợi ý các giải thưởng phù hợp với quy mô sự kiện.
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
              <div
                onClick={handleToggle}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: `2px solid ${isActive ? "#2563eb" : "#d1d5db"}`,
                  background: isActive ? "#2563eb" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .15s"
                }}
              >
                {isActive && <Check size={14} color="#fff" strokeWidth={4} />}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>Kích hoạt vòng quay may mắn cho sự kiện này</span>
            </label>
          </div>
        </div>
        {isActive && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0", animateIn: "fade-in" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Info size={16} className="text-indigo-600" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>Cấu hình chi tiết vòng quay</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", uppercase: true, letterSpacing: "0.05em" }}>Tiêu đề vòng quay</label>
                <input
                  style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
                  placeholder="VD: Quay số may mắn IUH 2024"
                  value={formData.luckyDrawTitle || ""}
                  onChange={(e) => setFormData({ ...formData, luckyDrawTitle: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", uppercase: true, letterSpacing: "0.05em" }}>Cơ chế trúng giải</label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", height: "100%", marginTop: 4 }}>
                  <input
                    type="checkbox"
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                    checked={formData.allowMultipleWins || false}
                    onChange={(e) => setFormData({ ...formData, allowMultipleWins: e.target.checked })}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Cho phép trúng nhiều giải</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", uppercase: true, letterSpacing: "0.05em" }}>Mô tả chương trình</label>
              <textarea
                style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, minHeight: 80, resize: "none", outline: "none" }}
                placeholder="Nhập mô tả ngắn gọn về chương trình quay số..."
                value={formData.luckyDrawDescription || ""}
                onChange={(e) => setFormData({ ...formData, luckyDrawDescription: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", uppercase: true, letterSpacing: "0.05em" }}>Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                  value={formData.luckyDrawStartTime || ""}
                  onChange={(e) => setFormData({ ...formData, luckyDrawStartTime: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#64748b", uppercase: true, letterSpacing: "0.05em" }}>Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
                  value={formData.luckyDrawEndTime || ""}
                  onChange={(e) => setFormData({ ...formData, luckyDrawEndTime: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <>
            {/* Prize List Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>Danh sách giải thưởng</h3>
              <div style={{ display: "flex", gap: 16 }}>
                <button
                  onClick={addManualPrize}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Plus size={16} /> Thêm thủ công
                </button>
                <button
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8b5cf6",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Sparkles size={16} /> AI gợi ý
                </button>
              </div>
            </div>

            {/* AI Suggestions Box */}
            {showAiSuggestions && (
              <div style={{
                background: "#fdfaff",
                border: "1px solid #f3e8ff",
                borderRadius: 16,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 13, fontWeight: 700 }}>
                  <Sparkles size={14} />
                  Gợi ý giải thưởng từ AI (dựa trên quy mô {formData.maxParticipants || 500} người)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {aiSuggestions.map((s, i) => (
                    <div key={i} style={{
                      background: "#fff",
                      padding: "12px 16px",
                      borderRadius: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #f1f5f9"
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          Số lượng: {s.count} • Tỷ lệ: {s.rate}% • {s.description}
                        </div>
                      </div>
                      <button
                        onClick={() => addPrize(s)}
                        style={{
                          background: "#8b5cf6",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prize Table */}
            <div style={{ border: "1px solid #f1f5f9", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 16px", color: "#475569", fontWeight: 700, width: "25%" }}>Tên giải thưởng</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", color: "#475569", fontWeight: 700, width: "40%" }}>Mô tả chi tiết</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Số lượng</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Tỷ lệ (%)</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.length > 0 ? (
                    prizes.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <input
                            style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#1e293b", fontWeight: 600, background: p.isDefault ? "transparent" : "#fff" }}
                            value={p.name}
                            readOnly={p.isDefault}
                            onChange={(e) => updatePrize(p.id, 'name', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <input
                            style={{ width: "100%", border: "1px solid transparent", outline: "none", fontSize: 12, color: "#64748b", background: p.isDefault ? "transparent" : "#f8fafc", padding: "4px 8px", borderRadius: 6, transition: "all 0.2s" }}
                            placeholder="Nhập mô tả giải thưởng..."
                            value={p.description || ""}
                            readOnly={p.isDefault}
                            onChange={(e) => updatePrize(p.id, 'description', e.target.value)}
                            onFocus={(e) => !p.isDefault && (e.target.style.borderColor = "#cbd5e1")}
                            onBlur={(e) => !p.isDefault && (e.target.style.borderColor = "transparent")}
                          />
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <input
                            type="number"
                            style={{ width: 60, border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 8px", textAlign: "center", background: p.isDefault ? "#f1f5f9" : "#fff" }}
                            value={p.count}
                            readOnly={p.isDefault}
                            onChange={(e) => updatePrize(p.id, 'count', parseInt(e.target.value))}
                          />
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <input
                            type="number"
                            style={{ width: 60, border: "1px solid #e2e8f0", borderRadius: 4, padding: "4px 8px", textAlign: "center", background: p.isDefault ? "#f1f5f9" : "#fff", color: p.isDefault ? "#8b5cf6" : "#1e293b", fontWeight: p.isDefault ? 800 : 400 }}
                            value={p.rate}
                            readOnly={p.isDefault}
                            onChange={(e) => updatePrize(p.id, 'rate', parseInt(e.target.value))}
                          />
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          {!p.isDefault && (
                            <button
                              onClick={() => removePrize(p.id)}
                              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                        Chưa có giải thưởng nào. Click "AI gợi ý" hoặc thêm thủ công.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


          </>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
        <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Quay lại
        </button>
        <button onClick={() => onNext(formData)} style={{ padding: "10px 32px", borderRadius: 8, border: "none", background: "#1e1b4b", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          Tiếp theo
        </button>
      </div>
    </div>
  );
}
