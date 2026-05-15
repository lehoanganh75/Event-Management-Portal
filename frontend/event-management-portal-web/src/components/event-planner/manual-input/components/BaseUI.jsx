import React, { useState } from "react";
import { ChevronDown, Sparkles, Check } from "lucide-react";

export const Field = ({ id, label, icon: Icon, required, error, hint, action, children }) => (
  <div id={id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "#1e293b",
        }}
      >
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {action}
    </div>
    {children}
    {error && (
      <p style={{ fontSize: 12, color: "#ef4444", margin: 0, fontWeight: 500 }}>{error}</p>
    )}
  </div>
);

export const Input = ({ error, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        color: "#1e293b",
        transition: "all .15s",
        borderRadius: 8,
        background: "#fff",
        border: `1px solid ${error ? "#fca5a5" : focused ? "#8b5cf6" : "#e2e8f0"}`,
        ...style,
      }}
    />
  );
};

export const Textarea = ({ error, rows = 3, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      rows={rows}
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
        color: "#1e293b",
        lineHeight: 1.6,
        transition: "all .15s",
        borderRadius: 8,
        background: "#fff",
        border: `1px solid ${error ? "#fca5a5" : focused ? "#8b5cf6" : "#e2e8f0"}`,
      }}
    />
  );
};

export const Select = ({ children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 40px 10px 14px",
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          color: "#1e293b",
          borderRadius: 8,
          background: "#fff",
          border: `1px solid ${focused ? "#8b5cf6" : "#e2e8f0"}`,
          transition: "all .15s",
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#94a3b8",
        }}
      />
    </div>
  );
};

export const AISuggestionBox = ({ title, suggestions, onSelect }) => (
  <div style={{
    background: "#fdfaff",
    border: "1px solid #f3e8ff",
    borderRadius: 12,
    padding: "16px",
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: 12
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 13, fontWeight: 600 }}>
      <Sparkles size={14} />
      {title}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {suggestions.map((s, i) => (
        <div
          key={`${i}-${typeof s === 'string' ? s : s.label}`}
          onClick={() => onSelect(s)}
          style={{
            background: "#fff",
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 13,
            color: "#475569",
            cursor: "pointer",
            border: "1px solid #f1f5f9",
            transition: "all .15s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#ddd6fe"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#f1f5f9"}
        >
          {typeof s === 'string' ? s : s.label}
        </div>
      ))}
    </div>
  </div>
);

export const Checkbox = ({ label, checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      userSelect: "none",
      padding: "4px 0"
    }}
  >
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `1.5px solid ${checked ? "#2563eb" : "#cbd5e1"}`,
        background: checked ? "#2563eb" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .15s"
      }}
    >
      {checked && <Check size={12} color="#fff" strokeWidth={4} />}
    </div>
    <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>{label}</span>
  </div>
);

export const DateTimeField = ({ label, value, onChange, error, required }) => {
  const formatLocal = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return typeof val === 'string' ? val : "";
    
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const stringValue = formatLocal(value);
  const [datePart, timePart] = stringValue.includes('T') ? stringValue.split('T') : [stringValue, "00:00"];
  
  const dateVal = datePart || "";
  const timeVal = timePart ? timePart.substring(0, 5) : "00:00";

  return (
    <Field label={label} required={required} error={error}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input
          type="date"
          value={dateVal}
          onChange={(e) => onChange(e.target.value + "T" + timeVal)}
          style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
        />
        <input
          type="time"
          value={timeVal}
          onChange={(e) => onChange(dateVal + "T" + e.target.value)}
          style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
        />
      </div>
    </Field>
  );
};
