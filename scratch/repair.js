
const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Tai_Lieu_Hoc_Tap', 'KLTN', 'KL_17_04', 'Event-Management-Portal', 'frontend', 'event-management-portal-web', 'src', 'components', 'chat', 'AIChatBot.jsx');

let content = fs.readFileSync(filepath, 'utf8');

// 1. Fix literal backslash-n sequences introduced by previous tools
content = content.replace(/\\n/g, '\n');

// 2. Fix the mess between linearGradient and parseQuickReplies
// Using a safe substring approach
const startMarker = '<stop offset="0%" stopColor="#4285F4" />';
const endMarker = 'function parseQuickReplies';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx + startMarker.length);
    const after = content.substring(endIdx);
    const mid = `
        <stop offset="100%" stopColor="#9B72CB" />
      </linearGradient>
    </defs>
  </svg>
);

// ✨✨ Phân tích Quick Replies ✨✨
`;
    content = before + mid + after;
}

// 3. Fix garbled comments and Vietnamese text
content = content.replace(/\[GI A\?:\\s\*\(.\+?\)\\\]/g, /\[GỢI Ý:\\s*(.+?)\\]/);
content = content.replace(/\[GI A\?:.*?\\\]/g, /\[GỢI Ý:.*?\\\]/);

// Specific replacements for the mess I saw
content = content.replace(/GI A\?/g, 'GỢI Ý');
content = content.replace(/o"PI_KEY/g, 'API_KEY');
content = content.replace(/INVo"LID/g, 'INVALID');
content = content.replace(/RESOURCE_EXHo"USTED/g, 'RESOURCE_EXHAUSTED');
content = content.replace(/PhAn tA-ch/g, 'Phân tích');
content = content.replace(/l-i/g, 'lỗi');
content = content.replace(/o"/g, '✨'); 
content = content.replace(/\?/g, '✨');
content = content.replace(/A/g, '✨');

// Ensure the Sparkles icon text is clean
content = content.replace(/Gemini 2.0 Flash ✨ IUH Event System/g, 'Gemini 2.0 Flash ✨ IUH Event System');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Repair Complete!');
