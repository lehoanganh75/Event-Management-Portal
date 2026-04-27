import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  Check,
  ArrowLeft,
  X,
  HelpCircle,
  BarChart2,
} from "lucide-react";

export default function InteractionStep({ formData, setFormData, onNext, onBack }) {
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [interactions, setInteractions] = useState(formData.interactions || []);
  const [settings, setSettings] = useState(formData.interactionSettings || {
    enableQA: true,
    enablePolls: true,
    allowUserQuestions: true,
  });

  const aiSuggestions = {
    questions: [
      "Câu hỏi nào bạn muốn hỏi diễn giả?",
      "Bạn nghĩ gì về xu hướng [chủ đề] hiện nay?",
      "Bạn muốn biết thêm về khía cạnh nào?",
      "Theo bạn, thách thức lớn nhất là gì?",
    ],
    polls: [
      {
        text: "Bạn đánh giá nội dung sự kiện như thế nào?",
        options: ["Rất hữu ích", "Hữu ích", "Bình thường", "Chưa hữu ích"]
      },
      {
        text: "Bạn có muốn tham gia sự kiện tương tự trong tương lai?",
        options: ["Chắc chắn có", "Có thể", "Chưa chắc", "Không"]
      },
      {
        text: "Chủ đề nào bạn muốn tìm hiểu thêm?",
        options: ["AI & Machine Learning", "Web Development", "Mobile App", "Data Science"]
      },
    ]
  };

  const handleSettingToggle = (field) => {
    const newSettings = { ...settings, [field]: !settings[field] };
    setSettings(newSettings);
    setFormData({ ...formData, interactionSettings: newSettings });
  };

  const addInteraction = (type, text, options = []) => {
    const newItem = {
      id: Date.now(),
      type, // 'question' or 'poll'
      text,
      options,
    };
    const newInteractions = [...interactions, newItem];
    setInteractions(newInteractions);
    setFormData({ ...formData, interactions: newInteractions });
  };

  const removeInteraction = (id) => {
    const newInteractions = interactions.filter((item) => item.id !== id);
    setInteractions(newInteractions);
    setFormData({ ...formData, interactions: newInteractions });
  };

  const [newType, setNewType] = useState('question');
  const [newText, setNewText] = useState('');

  const handleAddManual = () => {
    if (!newText.trim()) return;
    addInteraction(newType, newText, newType === 'poll' ? ['Lựa chọn 1', 'Lựa chọn 2'] : []);
    setNewText('');
  };

  const showInteractionList = settings.enableQA || settings.enablePolls;

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "32px", display: "flex", flexDirection: "column", gap: 32 }}>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Tương tác & Q&A</h2>

        {/* Settings Box */}
        <div style={{
          background: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: 16,
          padding: "24px",
          display: "flex",
          gap: 20,
          alignItems: "flex-start"
        }}>
          <div style={{
            width: 48,
            height: 48,
            background: "#dbeafe",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb"
          }}>
            <MessageSquare size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e3a8a", margin: "0 0 4px" }}>Tương tác với người tham dự</h3>
            <p style={{ fontSize: 13, color: "#3b82f6", margin: "0 0 16px", lineHeight: 1.5 }}>
              Tạo câu hỏi Q&A và bình chọn để tăng tương tác trong sự kiện. AI sẽ gợi ý câu hỏi phù hợp dựa trên loại sự kiện.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => handleSettingToggle('enableQA')}
                  style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `2px solid ${settings.enableQA ? "#2563eb" : "#cbd5e1"}`,
                    background: settings.enableQA ? "#2563eb" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {settings.enableQA && <Check size={12} color="#fff" strokeWidth={4} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Bật tính năng Q&A</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => handleSettingToggle('enablePolls')}
                  style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `2px solid ${settings.enablePolls ? "#2563eb" : "#cbd5e1"}`,
                    background: settings.enablePolls ? "#2563eb" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {settings.enablePolls && <Check size={12} color="#fff" strokeWidth={4} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Bật tính năng bình chọn</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => handleSettingToggle('allowUserQuestions')}
                  style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `2px solid ${settings.allowUserQuestions ? "#2563eb" : "#cbd5e1"}`,
                    background: settings.allowUserQuestions ? "#2563eb" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {settings.allowUserQuestions && <Check size={12} color="#fff" strokeWidth={4} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Cho phép người tham dự đặt câu hỏi</span>
              </label>
            </div>
          </div>
        </div>

        {showInteractionList ? (
          <>
            {/* List Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>Câu hỏi & Bình chọn</h3>
                <button
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                  style={{ background: "none", border: "none", color: "#8b5cf6", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Sparkles size={16} /> AI gợi ý câu hỏi
                </button>
              </div>

              {showAiSuggestions && (
                <div style={{ background: "#fdfaff", border: "1px solid #f3e8ff", borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 13, fontWeight: 700 }}>
                    <Sparkles size={14} />
                    Gợi ý từ AI cho sự kiện
                  </div>

                  {settings.enableQA && (
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.05em" }}>Câu hỏi Q&A</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {aiSuggestions.questions.map((q, i) => (
                          <div key={i} style={{ background: "#fff", padding: "12px 16px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f1f5f9" }}>
                            <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{q}</span>
                            <button onClick={() => addInteraction('question', q)} style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Thêm</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings.enablePolls && (
                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.05em" }}>Bình chọn</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {aiSuggestions.polls.map((p, i) => (
                          <div key={i} style={{ background: "#fff", padding: "16px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f1f5f9" }}>
                            <div>
                              <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 700 }}>{p.text}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{p.options.join(' • ')}</div>
                            </div>
                            <button onClick={() => addInteraction('poll', p.text, p.options)} style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Thêm</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                {interactions.map((item) => (
                  <div key={item.id} style={{ background: "#fafafa", padding: "16px 20px", borderRadius: 14, border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                        {item.type === 'question' ? <HelpCircle size={16} /> : <BarChart2 size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{item.text}</div>
                        {item.type === 'poll' && (
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.options.join(' • ')}</div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => removeInteraction(item.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Manual Section */}
            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Thêm nội dung mới</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 24 }}>
                  {settings.enableQA && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                      <input type="radio" checked={newType === 'question'} onChange={() => setNewType('question')} style={{ width: 16, height: 16 }} />
                      Câu hỏi văn bản
                    </label>
                  )}
                  {settings.enablePolls && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                      <input type="radio" checked={newType === 'poll'} onChange={() => setNewType('poll')} style={{ width: 16, height: 16 }} />
                      Bình chọn
                    </label>
                  )}
                </div>
                <input
                  placeholder="Nhập nội dung..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", outline: "none", fontSize: 14 }}
                />
                <button
                  onClick={handleAddManual}
                  style={{ width: "100%", padding: "12px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <Plus size={18} /> Thêm vào danh sách
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed #e2e8f0", borderRadius: 16, background: "#fcfcfc" }}>
            <MessageSquare size={32} style={{ color: "#cbd5e1", marginBottom: 12, opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>
              Kích hoạt tính năng Q&A hoặc Bình chọn để thiết lập nội dung tương tác.
            </p>
          </div>
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
