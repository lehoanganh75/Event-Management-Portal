const { query } = require("../config/db");

const isPlanningRequest = (prompt = "") => {
  return /lập kế hoạch chi tiết cho sự kiện|lập kế hoạch sự kiện|chuyên gia lập kế hoạch sự kiện|trích xuất và đề xuất thông tin sự kiện|MẪU SỰ KIỆN BẮT BUỘC|Văn bản đầu vào|TEMPLATE/i.test(prompt);
};

const isEventQuery = (prompt = "") => {
  return /sự kiện|event|workshop|đăng ký|diễn ra|lịch|địa điểm|check-?in|lucky|hội thảo|tham gia|tổ chức|diễn giả|người tham gia/i.test(prompt);
};

const isExternalDataPrompt = (prompt = "") => {
  return prompt.includes("Dựa trên thông tin sự kiện sau, hãy viết một bài đăng truyền thông");
};

const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  const clean = (t) => t.toLowerCase()
    .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "")
    .split(/\s+/)
    .filter(x => x.length > 2);
  const tokens1 = new Set(clean(text1));
  const tokens2 = new Set(clean(text2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  let intersect = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersect++;
  });
  return intersect / Math.max(tokens1.size, tokens2.size);
};

const mineSessionTemplate = (events) => {
  if (!events || events.length === 0) return "Không tìm thấy mẫu phiên phù hợp trong dữ liệu lịch sử.";
  let miningResult = "";
  events.forEach((ev, idx) => {
    const sessionTitles = (ev.sessions || []).map(s => s.title).join(" -> ");
    miningResult += `Sự kiện tham khảo ${idx + 1} ("${ev.title}"): ${sessionTitles || "Chưa có danh sách phiên"}\n`;
  });
  return miningResult;
};

const toSafeString = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "number" && Number.isNaN(val)) return "";
  return String(val);
};

const detectDateRangeInPrompt = (prompt = "") => {
  const lower = prompt.toLowerCase();
  let startDate = null;
  let endDate = null;

  // Today is May 24, 2026 based on system clock
  const today = new Date(2026, 4, 24);

  if (lower.includes("hôm nay") || lower.includes("ngày mai")) {
    startDate = new Date(today);
    if (lower.includes("ngày mai")) {
      startDate.setDate(startDate.getDate() + 1);
    }
  }

  const dayMatches = lower.match(/(?:ngày|đến)\s*(\d{1,2})/g);
  if (dayMatches) {
    dayMatches.forEach(m => {
      const dayNum = parseInt(m.match(/\d+/)[0], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        const d = new Date(today.getFullYear(), today.getMonth(), dayNum);
        if (!startDate) {
          startDate = d;
        } else {
          endDate = d;
        }
      }
    });
  }

  if (startDate && !endDate) {
    if (lower.includes("đến")) {
      endDate = startDate;
      startDate = new Date(today);
    }
  }

  return { startDate, endDate };
};

const pickRelevantEventsFromCache = (eventDbContext = "", userPrompt = "", limit = 5) => {
  const text = toSafeString(eventDbContext);

  if (!text) return "Hiện tại hệ thống chưa có dữ liệu sự kiện.";

  const parts = text.split(/\[THỐNG KÊ NGƯỜI THAM GIA NHIỀU NHẤT\]/i);
  const eventData = parts[0];
  const statsData = parts.length > 1 ? "[THỐNG KÊ NGƯỜI THAM GIA NHIỀU NHẤT]" + parts[1] : "";

  const blocks = eventData
    .split(/-+\n|\n-{5,}\n|\[SỰ KIỆN\s+\d+\]/i)
    .map((x) => x.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return statsData || "Hiện tại hệ thống chưa có dữ liệu sự kiện.";
  }

  const lowerPrompt = userPrompt.toLowerCase();

  // Define stop words to ignore when scoring event relevance
  const stopWords = new Set([
    "hãy", "tìm", "cho", "tôi", "sự", "kiện", "về", "và", "tại", "trường", "đại", 
    "học", "công", "nghiệp", "của", "có", "là", "trong", "ở", "được", "đến", 
    "các", "những", "tôi", "muốn", "hỏi", "xem", "lịch", "trình", "ngày", "hội", "thảo", "workshop", "event",
    "viết", "bài", "đăng", "quảng", "bá", "tạo", "caption", "post", "facebook", "linkedin", "email", "thông", "báo", "giới", "thiệu"
  ]);

  // Extract clean keywords from userPrompt (Vietnamese support)
  const keywords = lowerPrompt
    .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, " ")
    .split(/\s+/)
    .filter((x) => x.length >= 2 && !stopWords.has(x));

  const dateRange = detectDateRangeInPrompt(userPrompt);

  const scoredBlocks = blocks.map((block) => {
    const lowerBlock = block.toLowerCase();
    const titleLine = lowerBlock.split('\n').find((line) => line.includes('tên:')) || '';
    let score = 0;

    if (keywords.length > 0) {
      keywords.forEach((kw) => {
        let matches = false;
        if (/^\d+$/.test(kw) || kw.length <= 3) {
          const regex = new RegExp(`\\b${kw}\\b|\\b${kw}/|/${kw}/`, 'i');
          matches = regex.test(lowerBlock);
        } else {
          matches = lowerBlock.includes(kw);
        }

        if (matches) {
          score += 1;
          // Boost for matching in the title line specifically
          if (titleLine.includes(kw)) {
            score += 5;
          }
        }
      });
    }

    if (dateRange.startDate) {
      const startMatch = block.match(/Bắt đầu:\s*(\d{2})\/(\d{2})\/(\d{4})/);
      if (startMatch) {
        const day = parseInt(startMatch[1], 10);
        const month = parseInt(startMatch[2], 10);
        const year = parseInt(startMatch[3], 10);
        const eventStart = new Date(year, month - 1, day);

        if (dateRange.endDate) {
          if (eventStart >= dateRange.startDate && eventStart <= dateRange.endDate) {
            score += 100;
          }
        } else {
          if (eventStart.getTime() === dateRange.startDate.getTime()) {
            score += 100;
          }
        }
      }
    }

    if (/Trạng thái:\s*ONGOING|Đang diễn ra/i.test(block)) {
      score += 15;
    } else if (/Trạng thái:\s*PUBLISHED|Đã công bố/i.test(block)) {
      score += 10;
    }

    return { block, score };
  });

  const filtered = scoredBlocks
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.block);

  const resultBlocks = filtered.length > 0 ? filtered : blocks;
  const result = resultBlocks.slice(0, limit).join("\n\n---\n\n");
  
  return statsData ? result + "\n\n" + statsData : result;
};

const queryCandidateEvents = async () => {
  return await query(`
    SELECT id, title, description, event_topic, location, start_time, end_time, max_participants, registration_deadline, event_mode, has_lucky_draw, check_in_enabled, created_at
    FROM events
    WHERE status IN ('PUBLISHED', 'ONGOING', 'COMPLETED', 'PLAN_APPROVED', 'DRAFT', 'PLAN_PENDING_APPROVAL', 'EVENT_PENDING_APPROVAL')
  `);
};

const queryFeedbacksForEvent = async (eventId) => {
  return await query(
    `SELECT rating FROM event_feedbacks WHERE event_id = ? AND is_deleted = 0`,
    [eventId]
  );
};

const querySessionsForEvent = async (eventId) => {
  return await query(
    `SELECT title, description, room, type, start_time, end_time, order_index
     FROM event_sessions
     WHERE event_id = ? AND is_deleted = 0
     ORDER BY order_index ASC`,
     [eventId]
  );
};

const queryPresentersForEvent = async (eventId) => {
  return await query(
    `SELECT presenter_account_id FROM event_presenters WHERE event_id = ? AND is_deleted = 0`,
    [eventId]
  );
};

module.exports = {
  isPlanningRequest,
  isEventQuery,
  isExternalDataPrompt,
  calculateTextSimilarity,
  mineSessionTemplate,
  pickRelevantEventsFromCache,
  queryCandidateEvents,
  queryFeedbacksForEvent,
  querySessionsForEvent,
  queryPresentersForEvent,
  toSafeString,
};
