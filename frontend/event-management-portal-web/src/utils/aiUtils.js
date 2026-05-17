/**
 * ✨ Helper to extract and parse JSON safely from AI response
 * Handles common AI JSON formatting errors and truncated responses.
 */
export const safeParseAIJson = (text) => {
  if (!text) return null;
  try {
    // 1. Tìm khối JSON bằng Regex
    let cleanJson = "";
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) return null;

    cleanJson = text.substring(firstBrace);
    const lastBrace = cleanJson.lastIndexOf('}');

    if (lastBrace !== -1) {
      cleanJson = cleanJson.substring(0, lastBrace + 1);
    }

    // 2. Xử lý các lỗi cú pháp JSON phổ biến từ AI
    // - Loại bỏ các key bị "vỡ" ở cuối (ví dụ: ,"location":] hoặc ,"location":)
    cleanJson = cleanJson.replace(/,\s*"[^"]*"\s*:\s*[\]}]?\s*$/, '}');
    // - Sửa lỗi "key":] thành "key":""
    cleanJson = cleanJson.replace(/:\s*\]\s*([,}])/g, ': ""$1');
    // - Sửa lỗi "key":} thành "key":""
    cleanJson = cleanJson.replace(/:\s*\}\s*([,}])/g, ': ""$1');
    // - Xử lý lỗi "Unterminated string" do xuống dòng
    cleanJson = cleanJson.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, p1) => {
      return '"' + p1.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
    });

    // 3. Hàm vá lỗi JSON bị cắt ngang (tự đóng ngoặc)
    const repairJson = (json) => {
      let openBraces = 0;
      let openBrackets = 0;
      let inString = false;

      for (let i = 0; i < json.length; i++) {
        const char = json[i];
        if (char === '"' && (i === 0 || json[i - 1] !== '\\')) {
          inString = !inString;
        }
        if (!inString) {
          if (char === '{') openBraces++;
          else if (char === '}') openBraces--;
          else if (char === '[') openBrackets++;
          else if (char === ']') openBrackets--;
        }
      }

      let repaired = json;
      if (inString) repaired += '"';
      while (openBrackets > 0) { repaired += ']'; openBrackets--; }
      while (openBraces > 0) { repaired += '}'; openBraces--; }
      return repaired;
    };

    const repairedJson = repairJson(cleanJson);

    try {
      return JSON.parse(repairedJson);
    } catch (e) {
      // Thử dọn dẹp cực đoan nếu vẫn lỗi
      const crude = repairedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
      return JSON.parse(crude);
    }
  } catch (e) {
    console.error("Lỗi parse JSON AI hoàn toàn:", e, "\nNội dung thô:", text);
    return null;
  }
};

/**
 * Standardize date from AI to YYYY-MM-DDTHH:mm format
 * forceTime: Optional string "HH:mm" to override the time part
 */
export const formatAIDate = (dateStr, forceTime = null) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let hours, minutes;
    if (forceTime) {
      [hours, minutes] = forceTime.split(':');
    } else {
      hours = String(d.getHours()).padStart(2, '0');
      minutes = String(d.getMinutes()).padStart(2, '0');
    }

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
};

/**
 * Calculate similarity between two strings (0 to 1)
 * Using Sørensen–Dice coefficient
 */
export const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().replace(/\s+/g, "");
  const s2 = str2.toLowerCase().replace(/\s+/g, "");

  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams1 = new Set();
  for (let i = 0; i < s1.length - 1; i++) {
    bigrams1.add(s1.substring(i, i + 2));
  }

  const bigrams2 = new Set();
  for (let i = 0; i < s2.length - 1; i++) {
    bigrams2.add(s2.substring(i, i + 2));
  }

  let intersection = 0;
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) {
      intersection++;
    }
  }

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
};
