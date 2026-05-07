import React from 'react';

export const Field = ({ label, children, required, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
    )}
    {children}
  </div>
);

export const Input = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      transition: "all 0.2s",
      background: "#fff",
      ...props.style
    }}
  />
);

export const Select = (props) => (
  <select
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      background: "#fff",
      cursor: "pointer",
      ...props.style
    }}
  />
);

export const Textarea = (props) => (
  <textarea
    {...props}
    style={{
      width: "100%",
      padding: "12px 16px",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      resize: "none",
      background: "#fff",
      ...props.style
    }}
  />
);
