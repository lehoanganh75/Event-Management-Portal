
import re
import os

filepath = r'd:\Tai_Lieu_Hoc_Tap\KLTN\KL_17_04\Event-Management-Portal\frontend\event-management-portal-web\src\components\chat\AIChatBot.jsx'

with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Fix the broken GeminiIcon and parseQuickReplies area
# Match from the start of the broken stop tag to the end of cleanContent function
pattern = re.compile(r'<stop offset="0%" stopColor="#4285F4" />\s+<stop off.*?function cleanContent\(text\) \{[\s\S]*?\}', re.DOTALL)

replacement = r'''<stop offset="0%" stopColor="#4285F4" />
        <stop offset="100%" stopColor="#9B72CB" />
      </linearGradient>
    </defs>
  </svg>
);

// ✨✨ Phân tích Quick Replies ✨✨
function parseQuickReplies(text) {
  const match = text.match(/\[GỢI Ý:\s*(.+?)\]/);
  if (!match) return [];
  return match[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3);
}

function cleanContent(text) {
  return text.replace(/\[GỢI Ý:.*?\]/g, "").trim();
}'''

new_content = pattern.sub(replacement, content)

# Also fix any other garbled characters that might be there
# (Checking for the mess I saw in the previous view output)
new_content = new_content.replace('// "?"? PhAn tA-ch l-i Gemini "?"?', '// ✨✨ Phân tích lỗi Gemini ✨✨')
new_content = new_content.replace('// "?"? Retry countdown banner "?"?', '// ⏳ Banner đếm ngược thử lại')
new_content = new_content.replace('// "?"? Main "?"?', '// 💬 Main Component')
new_content = new_content.replace('// "?"? Icon: IUH logo + Gemini badge "?"?', '// 🎨 Icon: IUH logo + Gemini badge')
new_content = new_content.replace('// "?"? Gemini icon SVG "?"?', '// 🌟 Gemini icon SVG')
new_content = new_content.replace('// "?"? MessageContent "?"?', '// 🗨️ MessageContent')
new_content = new_content.replace('// "?"? Typing indicator "?"?', '// ✍️ Typing indicator')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Fixed!")
