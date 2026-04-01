import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, BarChart2, Pause, Play, Trash2, ChevronRight,
  CheckSquare, List, Clock, Users, X
} from "lucide-react";

const MOCK_POLLS = [
  {
    id: 1, status: "active",
    question: "Bạn đánh giá nội dung buổi hội thảo như thế nào?",
    type: "single", votes: 282,
    options: [
      { label: "Rất hữu ích", count: 145, color: "#3b82f6" },
      { label: "Hữu ích",     count: 89,  color: "#10b981" },
      { label: "Bình thường", count: 22,  color: "#f59e0b" },
      { label: "Chưa hữu ích",count: 5,   color: "#ef4444" },
    ]
  },
  {
    id: 2, status: "active",
    question: "Bạn muốn tổ chức hội thảo tiếp theo vào thời điểm nào?",
    type: "single", votes: 156,
    options: [
      { label: "Cuối tuần",   count: 78,  color: "#8b5cf6" },
      { label: "Ngày thường", count: 52,  color: "#06b6d4" },
      { label: "Tối",         count: 26,  color: "#f43f5e" },
    ]
  },
  {
    id: 3, status: "paused",
    question: "Chủ đề nào bạn muốn được đề cập trong buổi tới?",
    type: "multiple", votes: 94,
    options: [
      { label: "AI & Machine Learning", count: 44, color: "#3b82f6" },
      { label: "Web Development",       count: 30, color: "#10b981" },
      { label: "DevOps & Cloud",        count: 20, color: "#f59e0b" },
    ]
  },
];

function PollBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{pct}% ({count})</span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function CreatePollModal({ onClose, onSave }) {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => setOptions(o => [...o, ""]);
  const removeOption = (i) => setOptions(o => o.filter((_, idx) => idx !== i));
  const updateOption = (i, val) => setOptions(o => o.map((x, idx) => idx === i ? val : x));

  const handleSave = () => {
    if (!question.trim()) return;
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) return;
    onSave({
      id: Date.now(), status: "active",
      question: question.trim(), type, votes: 0,
      options: validOptions.map((label, i) => ({
        label, count: 0,
        color: ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"][i % 6]
      }))
    });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{ position: "relative", background: "#fff", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 520, boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Tạo bình chọn mới</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Câu hỏi *</label>
          <textarea
            placeholder="Nhập câu hỏi bình chọn..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Loại bình chọn</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { val: "single", label: "Một lựa chọn", icon: CheckSquare },
              { val: "multiple", label: "Nhiều lựa chọn", icon: List },
            ].map(t => (
              <button key={t.val} onClick={() => setType(t.val)} style={{
                flex: 1, padding: "10px 14px", border: `1.5px solid ${type === t.val ? "#3b82f6" : "#e2e8f0"}`,
                borderRadius: 10, background: type === t.val ? "#eff6ff" : "#fff",
                color: type === t.val ? "#2563eb" : "#64748b",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Các lựa chọn</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder={`Lựa chọn ${i + 1}`}
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit" }}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} style={{ border: "none", background: "#fff5f5", color: "#ef4444", borderRadius: 10, padding: "0 12px", cursor: "pointer" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addOption} style={{
            marginTop: 10, display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#3b82f6", fontWeight: 600,
            background: "none", border: "none", cursor: "pointer", padding: 0
          }}>
            <Plus size={14} /> Thêm lựa chọn
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", border: "1.5px solid #e2e8f0", borderRadius: 12,
            background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer"
          }}>Hủy</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "12px", border: "none", borderRadius: 12,
            background: "#1e293b", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}>Tạo bình chọn</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PollManagerPage() {
  const [polls, setPolls] = useState(MOCK_POLLS);
  const [showCreate, setShowCreate] = useState(false);

  const togglePause = (id) => setPolls(ps => ps.map(p => p.id === id ? { ...p, status: p.status === "active" ? "paused" : "active" } : p));
  const removePoll = (id) => setPolls(ps => ps.filter(p => p.id !== id));
  const addPoll = (poll) => setPolls(ps => [poll, ...ps]);

  const active = polls.filter(p => p.status === "active").length;
  const totalVotes = polls.reduce((s, p) => s + p.votes, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            Quản lý sự kiện
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.03em" }}>
            Kho quản lý khảo sát
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Điều phối bình chọn thời gian thực</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 20px", background: "#1e293b", color: "#fff",
          border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(15,23,42,0.25)"
        }}>
          <Plus size={16} /> TẠO KHẢO SÁT MỚI
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Đang chạy", value: active, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Tổng lượt bình chọn", value: totalVotes, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "Tổng khảo sát", value: polls.length, color: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 12, padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label}</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Poll cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        <AnimatePresence>
          {polls.map((poll, i) => (
            <motion.div key={poll.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0", overflow: "hidden" }}
            >
              {/* Card header */}
              <div style={{ padding: "16px 20px 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99,
                    background: poll.status === "active" ? "#dcfce7" : "#f1f5f9",
                    color: poll.status === "active" ? "#16a34a" : "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.06em"
                  }}>
                    {poll.status === "active" ? "● ĐANG CHẠY" : "⏸ TẠM DỪNG"}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => {}} style={{ border: "none", background: "#f8fafc", borderRadius: 8, padding: 6, cursor: "pointer", color: "#94a3b8" }}>
                      <BarChart2 size={14} />
                    </button>
                    <button onClick={() => removePoll(poll.id)} style={{ border: "none", background: "#fff5f5", borderRadius: 8, padding: 6, cursor: "pointer", color: "#ef4444" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.5 }}>
                  {poll.question}
                </p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={12} /> {poll.votes} lượt bình chọn
                  <span style={{ margin: "0 4px" }}>·</span>
                  {poll.type === "single" ? "Một lựa chọn" : "Nhiều lựa chọn"}
                </p>

                {/* Bars */}
                <div>
                  {poll.options.map(opt => (
                    <PollBar key={opt.label} label={opt.label} count={opt.count} total={poll.votes} color={opt.color} />
                  ))}
                </div>
              </div>

              {/* Card footer */}
              <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8 }}>
                <button onClick={() => togglePause(poll.id)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  background: poll.status === "active" ? "#fff7ed" : "#f0fdf4",
                  color: poll.status === "active" ? "#f97316" : "#10b981",
                  border: `1px solid ${poll.status === "active" ? "#fed7aa" : "#bbf7d0"}`,
                  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}>
                  {poll.status === "active" ? <><Pause size={12} /> TẠM DỪNG</> : <><Play size={12} /> TIẾP TỤC</>}
                </button>
                <button style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", background: "#fff",
                  color: "#64748b", border: "1px solid #e2e8f0",
                  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}>
                  <BarChart2 size={12} /> KẾT QUẢ
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {polls.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
          <BarChart2 size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>Chưa có khảo sát nào</p>
        </div>
      )}

      {showCreate && <CreatePollModal onClose={() => setShowCreate(false)} onSave={addPoll} />}
    </div>
  );
}