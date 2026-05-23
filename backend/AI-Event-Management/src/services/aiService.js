const {
  genAI,
  getGeminiModel,
  GEMINI_MODELS,
  GEMINI_EMBEDDING_MODELS,
  GEMINI_API_KEY,
  OLLAMA_URL,
  OLLAMA_MODEL,
  OLLAMA_EMBEDDING_MODEL,
} = require("../config/ai");

const { getEventCache, loadEventDataOnce } = require("./eventCacheService");
const crypto = require("crypto");
const { query } = require("../config/db");

const isPlanningRequest = (prompt = "") => {
  return /lập kế hoạch chi tiết cho sự kiện|lập kế hoạch sự kiện|chuyên gia lập kế hoạch sự kiện|trích xuất và đề xuất thông tin sự kiện|MẪU SỰ KIỆN BẮT BUỘC|Văn bản đầu vào|TEMPLATE/i.test(prompt);
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

const validatePlan = (plan) => {
  const errors = [];
  if (!plan) {
    errors.push("Bản kế hoạch trống hoặc không hợp lệ");
    return errors;
  }

  const requiredFields = [
    "title", "purpose", "description", "subject", "suggestedLocation",
    "estimatedParticipants", "suggestedOrganizerName", "suggestedStartTime",
    "suggestedEndTime", "registrationDeadline", "programItems"
  ];

  requiredFields.forEach(f => {
    if (plan[f] === undefined || plan[f] === null || plan[f] === "") {
      errors.push(`Thiếu trường thông tin bắt buộc: ${f}`);
    }
  });

  if (plan.suggestedStartTime && plan.suggestedEndTime) {
    const start = new Date(plan.suggestedStartTime);
    const end = new Date(plan.suggestedEndTime);
    if (isNaN(start.getTime())) errors.push("Định dạng suggestedStartTime không hợp lệ");
    if (isNaN(end.getTime())) errors.push("Định dạng suggestedEndTime không hợp lệ");
    if (start >= end) errors.push("suggestedStartTime phải trước suggestedEndTime");
  }

  if (plan.registrationDeadline && plan.suggestedStartTime) {
    const deadline = new Date(plan.registrationDeadline);
    const start = new Date(plan.suggestedStartTime);
    if (isNaN(deadline.getTime())) errors.push("Định dạng registrationDeadline không hợp lệ");
    if (deadline > start) errors.push("registrationDeadline phải trước hoặc bằng suggestedStartTime");
  }

  const items = plan.programItems;
  if (Array.isArray(items)) {
    if (items.length === 0) {
      errors.push("Danh sách programItems không được để trống");
    } else {
      items.forEach((item, idx) => {
        if (!item.title) errors.push(`Phiên thứ ${idx + 1} thiếu tiêu đề`);
        if (!item.startTime) errors.push(`Phiên thứ ${idx + 1} thiếu startTime`);
        if (!item.endTime) errors.push(`Phiên thứ ${idx + 1} thiếu endTime`);
        if (item.startTime && item.endTime) {
          const s = new Date(item.startTime);
          const e = new Date(item.endTime);
          if (isNaN(s.getTime())) errors.push(`Phiên thứ ${idx + 1} có startTime không hợp lệ`);
          if (isNaN(e.getTime())) errors.push(`Phiên thứ ${idx + 1} có endTime không hợp lệ`);
          if (s >= e) errors.push(`Phiên thứ ${idx + 1} có startTime phải trước endTime`);
        }
      });
    }
  } else if (items) {
    errors.push("programItems phải là một mảng");
  }

  return errors;
};

const selfNormalizePlan = (plan, userPrompt = "") => {
  if (!plan) plan = {};

  plan.title = plan.title || "Sự kiện IUH mới";
  plan.purpose = plan.purpose || "Mục đích sự kiện";
  plan.description = plan.description || "Mô tả sự kiện";
  plan.subject = plan.subject || "Chủ đề sự kiện";
  plan.suggestedLocation = plan.suggestedLocation || "Hội trường E4";
  plan.goal = plan.goal || "Nâng cao kiến thức và phát triển kỹ năng thực hành cho sinh viên.";
  plan.requirement = plan.requirement || "Sinh viên đăng ký tham gia đúng hạn, mang theo dụng cụ học tập hoặc laptop nếu có yêu cầu.";
  
  if (typeof plan.estimatedParticipants === "string") {
    plan.estimatedParticipants = parseInt(plan.estimatedParticipants, 10) || 200;
  } else if (!plan.estimatedParticipants) {
    plan.estimatedParticipants = 200;
  }

  plan.suggestedOrganizerName = plan.suggestedOrganizerName || "Đoàn Thanh niên IUH";
  plan.suggestedOrganizerDescription = plan.suggestedOrganizerDescription || "Ban tổ chức sự kiện chuyên nghiệp IUH";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const p = (userPrompt || "").toLowerCase();
  const isTodayRequested = p.includes("hôm nay") || p.includes("today") || p.includes("khẩn cấp") || p.includes("gấp");

  const todayStr = today.toISOString().split("T")[0];

  let regDeadline = new Date(plan.registrationDeadline);
  let startTime = new Date(plan.suggestedStartTime);
  let endTime = new Date(plan.suggestedEndTime);

  // Fallbacks for invalid dates
  if (isNaN(startTime.getTime())) {
    startTime = new Date(today.getTime() + (isTodayRequested ? 0 : 2) * 24 * 60 * 60 * 1000);
    startTime.setHours(7, 0, 0, 0);
  }
  if (isNaN(endTime.getTime())) {
    endTime = new Date(startTime.getTime());
    endTime.setHours(23, 59, 59, 999);
  }
  if (isNaN(regDeadline.getTime())) {
    regDeadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    regDeadline.setHours(23, 59, 59, 999);
  }

  // Calculate shift difference relative to target event date
  const eventDateOnly = new Date(startTime.getTime());
  eventDateOnly.setHours(0, 0, 0, 0);

  let targetEventDate = new Date(eventDateOnly.getTime());

  if (eventDateOnly < today || isTodayRequested) {
    if (isTodayRequested) {
      targetEventDate = new Date(today.getTime());
    } else {
      targetEventDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    }
  }

  const diffMs = targetEventDate.getTime() - eventDateOnly.getTime();

  if (diffMs !== 0) {
    startTime = new Date(startTime.getTime() + diffMs);
    endTime = new Date(endTime.getTime() + diffMs);
    regDeadline = new Date(regDeadline.getTime() + diffMs);
  }

  startTime.setHours(7, 0, 0, 0);
  endTime.setHours(23, 59, 59, 999);

  // Enforce deadline constraint
  if (regDeadline > startTime) {
    regDeadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    regDeadline.setHours(23, 59, 59, 999);
  }

  // Enforce today's check
  if (regDeadline < today && !isTodayRequested) {
    regDeadline = new Date(today.getTime());
    regDeadline.setHours(23, 59, 59, 999);
    if (startTime < regDeadline) {
      startTime = new Date(regDeadline.getTime() + 24 * 60 * 60 * 1000);
      startTime.setHours(7, 0, 0, 0);
      endTime = new Date(startTime.getTime());
      endTime.setHours(23, 59, 59, 999);
    }
  }

  const formatDateISO = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  plan.registrationDeadline = formatDateISO(regDeadline);
  plan.suggestedStartTime = formatDateISO(startTime);
  plan.suggestedEndTime = formatDateISO(endTime);

  let items = plan.programItems || [];
  if (!Array.isArray(items) || items.length === 0) {
    items = [{
      title: "Phiên khai mạc và định hướng",
      description: "Giới thiệu sự kiện và các nội dung chính",
      startTime: plan.suggestedStartTime,
      endTime: formatDateISO(new Date(startTime.getTime() + 2 * 60 * 60 * 1000)),
      durationMinutes: 120,
      speaker: "Ban tổ chức",
      location: plan.suggestedLocation
    }];
  }

  let currentSessionTime = new Date(startTime.getTime());
  currentSessionTime.setHours(8, 0, 0, 0);

  items.forEach((item, idx) => {
    item.title = item.title || `Phiên chương trình ${idx + 1}`;
    item.description = item.description || `Mô tả chi tiết phiên chương trình ${idx + 1}`;
    item.speaker = item.speaker || "Diễn giả đề xuất";
    item.location = item.location || plan.suggestedLocation;
    
    let duration = parseInt(item.durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      duration = 60;
    }
    item.durationMinutes = duration;

    let sTime = new Date(item.startTime);
    let eTime = new Date(item.endTime);

    // Apply shift if it was a valid date
    if (!isNaN(sTime.getTime()) && diffMs !== 0) {
      sTime = new Date(sTime.getTime() + diffMs);
      item.startTime = formatDateISO(sTime);
    }
    if (!isNaN(eTime.getTime()) && diffMs !== 0) {
      eTime = new Date(eTime.getTime() + diffMs);
      item.endTime = formatDateISO(eTime);
    }

    // Fallback if times are invalid
    if (isNaN(sTime.getTime()) || isNaN(eTime.getTime())) {
      if (currentSessionTime >= endTime) {
        const daysDiff = Math.floor((currentSessionTime - startTime) / (24 * 60 * 60 * 1000));
        currentSessionTime = new Date(startTime.getTime() + (daysDiff + 1) * 24 * 60 * 60 * 1000);
        currentSessionTime.setHours(8, 0, 0, 0);
      }

      item.startTime = formatDateISO(currentSessionTime);
      const sessionEndTime = new Date(currentSessionTime.getTime() + duration * 60 * 1000);
      item.endTime = formatDateISO(sessionEndTime);

      currentSessionTime = new Date(sessionEndTime.getTime() + 15 * 60 * 1000);
    } else {
      currentSessionTime = new Date(eTime.getTime() + 15 * 60 * 1000);
    }
  });

  plan.programItems = items;
  return plan;
};

const runSmartPlanningPipeline = async (userPrompt, accountId = null, template = null) => {
  const sessionId = crypto.randomUUID();
  console.log(`[SmartPlanning] Starting 14-step pipeline for session: ${sessionId}`);

  let intent = {
    eventType: "Hội thảo",
    topic: "Chủ đề sự kiện",
    sessionCount: 3,
    targetAudience: "Sinh viên IUH",
    timeInfo: "Trong thời gian tới",
    location: "Hội trường E4",
    estimatedParticipants: 200,
    queryKeywords: ["Hội thảo", "Sự kiện"]
  };

  const intentExtractionPrompt = `Hãy đóng vai trò là một trợ lý phân tích yêu cầu sự kiện chuyên nghiệp tại IUH.
Nhiệm vụ của bạn là bóc tách các yêu cầu lập kế hoạch sự kiện của người dùng từ văn bản sau thành cấu trúc JSON.
Đồng thời, đề xuất ra 3-5 từ khóa mở rộng (queryKeywords) bằng tiếng Việt hoặc tiếng Anh dùng để truy vấn tìm kiếm các sự kiện tương tự trong cơ sở dữ liệu.

Văn bản yêu cầu của người dùng: "${userPrompt}"

Hãy trả về DUY NHẤT một khối JSON hợp lệ với cấu trúc sau, không nằm trong codeblock markdown, không giải thích:
{
  "eventType": "Loại sự kiện (ví dụ: Hội thảo, Workshop, Seminar, Cuộc thi, Lễ hội...)",
  "topic": "Chủ đề chính hoặc nội dung cốt lõi của sự kiện",
  "sessionCount": "Số lượng phiên/session mong muốn (nếu không nói cụ thể, hãy điền null)",
  "targetAudience": "Đối tượng tham gia chính",
  "timeInfo": "Thông tin thời gian mô tả (ví dụ: hạn đăng ký 2 tuần, diễn ra trong tháng sau...)",
  "location": "Địa điểm ưu tiên tổ chức (nếu có)",
  "estimatedParticipants": "Số lượng người tham gia dự kiến (nếu không có, điền 200)",
  "queryKeywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"]
}`;

  console.log("[SmartPlanning] Extracting intent and keywords...");
  const intentResult = await askGemini({
    systemInstruction: "Bạn là trợ lý trích xuất dữ liệu JSON.",
    userPrompt: intentExtractionPrompt,
    isExtraction: true
  }) || await askOllama({
    systemInstruction: "Bạn là trợ lý trích xuất dữ liệu JSON.",
    userPrompt: intentExtractionPrompt,
    isExtraction: true
  });

  if (intentResult && intentResult.reply) {
    try {
      const cleanJson = cleanJsonResponse(intentResult.reply);
      const parsedIntent = JSON.parse(cleanJson);
      intent = { ...intent, ...parsedIntent };
      console.log("[SmartPlanning] Intent extracted successfully:", JSON.stringify(intent));
    } catch (e) {
      console.error("[SmartPlanning] Failed to parse intent JSON, using defaults:", e.message);
    }
  }

  console.log("[SmartPlanning] Querying candidate events from DB...");
  let candidateEvents = [];
  try {
    candidateEvents = await query(`
      SELECT id, title, description, event_topic, location, start_time, end_time, max_participants, registration_deadline, event_mode, has_lucky_draw, check_in_enabled, created_at
      FROM events
      WHERE status IN ('PUBLISHED', 'ONGOING', 'COMPLETED')
    `);
  } catch (err) {
    console.error("[SmartPlanning] Error querying events table:", err.message);
  }

  const keywords = intent.queryKeywords || [];
  candidateEvents.forEach(event => {
    let keywordMatches = 0;
    keywords.forEach(kw => {
      const lowerKw = kw.toLowerCase();
      if (event.title?.toLowerCase().includes(lowerKw)) keywordMatches += 2;
      if (event.description?.toLowerCase().includes(lowerKw)) keywordMatches += 1;
      if (event.event_topic?.toLowerCase().includes(lowerKw)) keywordMatches += 1.5;
    });

    const similarity = (calculateTextSimilarity(intent.topic, event.title) * 0.5 +
                        calculateTextSimilarity(intent.eventType, event.event_topic || "") * 0.3 +
                        (keywordMatches > 0 ? Math.min(keywordMatches / 5, 1.0) : 0) * 0.2);
    
    event.similarityScore = similarity;
  });

  const topCandidates = candidateEvents
    .filter(ev => ev.similarityScore > 0.1)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);

  console.log(`[SmartPlanning] Loading feedbacks and sessions for top ${topCandidates.length} candidates...`);
  for (const ev of topCandidates) {
    try {
      const feedbacks = await query(
        `SELECT rating FROM event_feedbacks WHERE event_id = ? AND is_deleted = 0`,
        [ev.id]
      );
      ev.feedbacks = feedbacks || [];
    } catch (e) {
      console.error(`[SmartPlanning] Error loading feedbacks for event ${ev.id}:`, e.message);
      ev.feedbacks = [];
    }

    try {
      const sessions = await query(
        `SELECT title, description, room, type, start_time, end_time, order_index
         FROM event_sessions
         WHERE event_id = ? AND is_deleted = 0
         ORDER BY order_index ASC`,
         [ev.id]
      );
      ev.sessions = sessions || [];
    } catch (e) {
      console.error(`[SmartPlanning] Error loading sessions for event ${ev.id}:`, e.message);
      ev.sessions = [];
    }
  }

  topCandidates.forEach(ev => {
    const sim = ev.similarityScore || 0;

    let feed = 0.8;
    if (ev.feedbacks.length > 0) {
      const avg = ev.feedbacks.reduce((sum, f) => sum + f.rating, 0) / ev.feedbacks.length;
      feed = avg / 5.0;
    }

    let sessQual = 0;
    if (ev.sessions.length > 0) {
      let complete = 0;
      ev.sessions.forEach(s => {
        if (s.title && s.description && s.room && s.start_time && s.end_time) {
          complete++;
        }
      });
      sessQual = complete / ev.sessions.length;
    }

    const eventDate = new Date(ev.start_time || ev.created_at || new Date());
    const diffTime = Math.abs(new Date() - eventDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const rec = Math.exp(-diffDays / 365);

    let comp = 0;
    const checkFields = ['description', 'location', 'max_participants', 'registration_deadline', 'event_mode', 'has_lucky_draw', 'check_in_enabled'];
    let present = 0;
    checkFields.forEach(f => {
      if (ev[f] !== null && ev[f] !== undefined && ev[f] !== '') {
        present++;
      }
    });
    comp = present / checkFields.length;

    ev.finalScore = (sim * 0.45) + (feed * 0.25) + (sessQual * 0.15) + (rec * 0.10) + (comp * 0.05);
  });

  const selectedEvents = topCandidates
    .filter(ev => ev.finalScore > 0.2)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 3);

  const sessionTemplatesMined = mineSessionTemplate(selectedEvents);

  const todayStr = new Date().toISOString().split('T')[0];
  const systemInstruction = `Bạn là Chuyên gia Lập kế hoạch Sự kiện cấp cao (Event Architect) tại Trường Đại học Công nghiệp TP.HCM (IUH).
Nhiệm vụ của bạn là thiết kế một bản kế hoạch sự kiện chi tiết và chuyên nghiệp dựa trên yêu cầu của người dùng, kết hợp tham khảo các sự kiện mẫu thành công trong lịch sử hệ thống.

${template ? `
MẪU SỰ KIỆN BẮT BUỘC SỬ DỤNG: "${template.templateName}"
MÔ TẢ MẪU: ${template.description}

YÊU CẦU QUAN TRỌNG:
- TÊN SỰ KIỆN và NỘI DUNG PHẢI bám sát mẫu sự kiện "${template.templateName}". KHÔNG ĐƯỢC tự ý đổi sang loại hình sự kiện khác hoặc trượt khỏi chủ đề mẫu.
` : ""}

QUY TẮC THỜI GIAN NGHIÊM NGẶT:
1. Ngày hiện tại (Hôm nay): ${todayStr}.
2. Thứ tự thời gian PHẢI tuyệt đối tuân thủ: Hôm nay <= registrationDeadline <= suggestedStartTime < suggestedEndTime.
3. Định dạng giờ mặc định (BẮT BUỘC):
   - suggestedStartTime PHẢI bắt đầu vào lúc 07:00:00 (định dạng YYYY-MM-DDT07:00:00).
   - suggestedEndTime PHẢI kết thúc vào lúc 23:59:59 (định dạng YYYY-MM-DDT23:59:59).
   - registrationDeadline PHẢI đặt vào lúc 23:59:59 (định dạng YYYY-MM-DDT23:59:59).

QUY TẮC PHÂN CHIA PHIÊN (PROGRAM ITEMS):
- Đảm bảo thiết kế đúng số phiên theo yêu cầu người dùng (nếu không yêu cầu cụ thể, tạo từ 3 đến 6 phiên hợp lý).
- Thời gian của các phiên phải nằm trong khoảng từ suggestedStartTime đến suggestedEndTime, không chồng chéo nhau, sắp xếp theo thứ tự thời gian tăng dần và khớp với orderIndex.
- Mỗi phiên phải có đầy đủ: title, description, startTime (định dạng ISO), endTime (định dạng ISO), durationMinutes (số phút hợp lý), speaker, location (phòng học/hội trường IUH ví dụ: Hội trường E4, Phòng H3.1, Sân trường...).

ĐẦU RA:
Chỉ trả về duy nhất một khối JSON hợp lệ theo cấu trúc mẫu dưới đây, không bọc trong markdown codeblock \`\`\`json, không giải thích thêm:
{
  "title": "Tên sự kiện chi tiết, hấp dẫn",
  "purpose": "Mục đích sự kiện rõ ràng",
  "description": "Mô tả chi tiết nội dung sự kiện",
  "subject": "Chủ đề chính",
  "suggestedLocation": "Địa điểm tổ chức đề xuất tại IUH",
  "estimatedParticipants": 200,
  "suggestedOrganizerName": "Tên ban tổ chức đề xuất",
  "suggestedOrganizerDescription": "Mô tả ngắn gọn về năng lực ban tổ chức",
  "suggestedStartTime": "YYYY-MM-DDT07:00:00",
  "suggestedEndTime": "YYYY-MM-DDT23:59:59",
  "registrationDeadline": "YYYY-MM-DDT23:59:59",
  "goal": "Mục tiêu sự kiện (VD: Nâng cao kỹ năng, kết nối doanh nghiệp...)",
  "requirement": "Yêu cầu đối với người tham gia (VD: Mang theo laptop, sinh viên năm 3, 4...)",
  "programItems": [
    {
      "title": "Tên phiên",
      "description": "Mô tả chi tiết nội dung phiên",
      "startTime": "YYYY-MM-DDT08:00:00",
      "endTime": "YYYY-MM-DDT09:00:00",
      "durationMinutes": 60,
      "speaker": "Tên diễn giả/người phụ trách",
      "location": "Vị trí/Phòng cụ thể (ví dụ: Sân khấu chính, Hội trường E4...)"
    }
  ],
  "reasoning": "Giải thích ngắn gọn lý do thiết kế cấu trúc sự kiện này dựa trên dữ liệu tham khảo lịch sử."
}`;

  const planningPrompt = `Yêu cầu lập kế hoạch của người dùng: "${userPrompt}"

${template ? `
Mẫu sự kiện áp dụng: "${template.templateName}"
Mô tả mẫu: ${template.description}
` : ""}

Dữ liệu trích xuất ý định:
- Loại sự kiện: ${intent.eventType}
- Chủ đề: ${intent.topic}
- Số phiên yêu cầu: ${intent.sessionCount || "Tự động đề xuất"}
- Đối tượng tham gia: ${intent.targetAudience || "Sinh viên/Giảng viên IUH"}

Sự kiện tham khảo hàng đầu từ cơ sở dữ liệu (đã lọc bằng CBR):
${selectedEvents.length > 0 ? selectedEvents.map((ev, i) => `
[Sự kiện mẫu ${i+1}]
Tiêu đề: ${ev.title}
Địa điểm: ${ev.location}
Chủ đề: ${ev.event_topic}
Điểm chất lượng: ${ev.finalScore.toFixed(2)}
Phiên tham khảo:
${(ev.sessions || []).map(s => `- ${s.title} (${s.room})`).join("\n")}
`).join("\n") : "Không có sự kiện tương tự trong lịch sử."}

Mẫu phiên khai phá (Session Template Mining):
${sessionTemplatesMined}

Hãy tạo bản kế hoạch JSON hoàn hảo tuân thủ các quy tắc trên.`;

  console.log("[SmartPlanning] Generating plan from Gemini/Ollama...");
  let providerUsed = "gemini";
  let modelUsed = "gemini-pro";
  let geminiOutput = await askGemini({
    systemInstruction,
    userPrompt: planningPrompt,
    isExtraction: true
  });

  if (!geminiOutput) {
    console.log("[SmartPlanning] Gemini planning failed or quota exceeded. Falling back to Ollama...");
    providerUsed = "ollama";
    modelUsed = OLLAMA_MODEL || "qwen2.5:3b";
    geminiOutput = await askOllama({
      systemInstruction,
      userPrompt: planningPrompt,
      isExtraction: true
    });
  } else {
    modelUsed = geminiOutput.model;
  }

  let rawReplyText = geminiOutput ? geminiOutput.reply : "";
  let finalPlan = null;
  let validationErrors = [];
  let repairAttempts = 0;

  const parseAndValidate = (text) => {
    try {
      const clean = cleanJsonResponse(text);
      const parsed = JSON.parse(clean);
      const errs = validatePlan(parsed);
      return { parsed, errs };
    } catch (e) {
      return { parsed: null, errs: [`JSON parse error: ${e.message}`] };
    }
  };

  let { parsed: parsedPlan, errs } = parseAndValidate(rawReplyText);
  finalPlan = parsedPlan;
  validationErrors = errs;

  while (validationErrors.length > 0 && repairAttempts < 2) {
    repairAttempts++;
    console.log(`[SmartPlanning] Validation failed. Attempting Auto-Repair #${repairAttempts}...`);
    const repairPromptText = `Bản kế hoạch JSON bạn vừa tạo có các lỗi sau đây:
${validationErrors.join("\n")}

JSON bị lỗi:
${rawReplyText}

Hãy chỉnh sửa lại khối JSON trên để khắc phục hoàn toàn các lỗi này. Trả về DUY NHẤT một khối JSON hợp lệ, không bọc trong codeblock markdown, không giải thích gì thêm.`;

    const repairOutput = await askGemini({
      systemInstruction: "Bạn là trợ lý sửa lỗi JSON chuyên nghiệp.",
      userPrompt: repairPromptText,
      isExtraction: true
    }) || await askOllama({
      systemInstruction: "Bạn là trợ lý sửa lỗi JSON chuyên nghiệp.",
      userPrompt: repairPromptText,
      isExtraction: true
    });

    if (repairOutput && repairOutput.reply) {
      rawReplyText = repairOutput.reply;
      const repairRes = parseAndValidate(rawReplyText);
      finalPlan = repairRes.parsed;
      validationErrors = repairRes.errs;
    }
  }

  let usedSelfNormalization = false;
  if (validationErrors.length > 0 || !finalPlan) {
    console.warn("[SmartPlanning] Validation had errors or repair incomplete. Running robust Backend Self-Normalization...");
    usedSelfNormalization = true;
  }

  // Always run self-normalization to guarantee correct dates, default fallbacks, and user prompt date mapping
  finalPlan = selfNormalizePlan(finalPlan || {}, userPrompt);
  console.log("[SmartPlanning] Self-normalization complete.");

  const bestScore = selectedEvents[0]?.finalScore || 0;
  const confidenceScore = selectedEvents.length > 0 
    ? parseFloat((0.5 + Math.min(selectedEvents.length * 0.1, 0.3) + Math.min(bestScore, 0.2)).toFixed(2))
    : 0.4;
  
  let dataSourceQuality = "LOW";
  if (selectedEvents.length >= 2 && bestScore >= 0.6) {
    dataSourceQuality = "HIGH";
  } else if (selectedEvents.length >= 1 && bestScore >= 0.4) {
    dataSourceQuality = "MEDIUM";
  }

  const needsHumanReview = selectedEvents.length === 0 || bestScore < 0.4 || usedSelfNormalization || validationErrors.length > 0;

  finalPlan.confidenceScore = confidenceScore;
  finalPlan.dataSourceQuality = dataSourceQuality;
  finalPlan.similarEventsUsed = selectedEvents.length;
  finalPlan.needsHumanReview = needsHumanReview;

  try {
    console.log("[SmartPlanning] Logging execution details into audit table...");
    await query(
      `INSERT INTO ai_planning_audit_logs 
       (session_id, user_prompt, intent_extracted, events_retrieved, best_events_selected, validation_errors, repair_attempts, final_output)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userPrompt,
        JSON.stringify(intent),
        JSON.stringify(selectedEvents.map(e => ({ id: e.id, title: e.title, score: e.finalScore }))),
        JSON.stringify(selectedEvents.map(e => e.id)),
        JSON.stringify(validationErrors),
        repairAttempts,
        JSON.stringify(finalPlan)
      ]
    );
    console.log("[SmartPlanning] Audit logged successfully.");
  } catch (err) {
    console.error("[SmartPlanning] Audit logging failed:", err.message);
  }

  return {
    provider: providerUsed,
    model: modelUsed,
    reply: JSON.stringify(finalPlan)
  };
};

const toSafeString = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "number" && Number.isNaN(val)) return "";
  return String(val);
};

const isLimitError = (error) => {
  const msg = (error?.message || "").toLowerCase();

  return (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("429")
  );
};

const isEventQuery = (prompt = "") => {
  return /sự kiện|event|workshop|đăng ký|diễn ra|lịch|địa điểm|check-?in|lucky|hội thảo|tham gia|tổ chức|diễn giả|người tham gia/i.test(
    prompt
  );
};

const isExternalDataPrompt = (prompt = "") => {
  return /dữ liệu\s*:|dữ liệu sự kiện\s*:|eventdetails|thông tin sự kiện sau|hãy viết|bài đăng truyền thông|facebook|linkedin|generate|lập kế hoạch|mẫu sự kiện|template/i.test(
    prompt
  );
};

const pickRelevantEventsFromCache = (eventDbContext = "", userPrompt = "", limit = 5) => {
  const text = toSafeString(eventDbContext);

  if (!text) return "Hiện tại hệ thống chưa có dữ liệu sự kiện.";

  // Split but keep the stats block separate
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

  let filtered = blocks;

  if (
    lowerPrompt.includes("sắp diễn ra") ||
    lowerPrompt.includes("sắp tới") ||
    lowerPrompt.includes("mở đăng ký") ||
    lowerPrompt.includes("workshop") ||
    lowerPrompt.includes("event")
  ) {
    filtered = blocks.filter((b) =>
      /PUBLISHED|ONGOING|Đã công bố|Đang diễn ra/i.test(b)
    );
  }

  if (filtered.length === 0) {
    filtered = blocks;
  }

  const result = filtered.slice(0, limit).join("\n\n---\n\n");
  
  return statsData ? result + "\n\n" + statsData : result;
};

const buildGeminiSystemInstruction = ({
  eventDbContext,
  pdfContext,
  isExtraction,
  shouldUseEventDb,
}) => {
  const dbContext =
    shouldUseEventDb
      ? toSafeString(eventDbContext) || "Hiện tại hệ thống chưa có dữ liệu sự kiện."
      : "";

  const safePdfContext = toSafeString(pdfContext);

  return `
Bạn là trợ lý AI cao cấp của Hệ thống Quản lý Sự kiện IUH - Đại học Công nghiệp TP.HCM.

VAI TRÒ:
- Hỗ trợ tra cứu sự kiện, hướng dẫn đăng ký, tóm tắt nội dung và tạo nội dung truyền thông.
- Khi có EVENT_DB, chỉ trả lời sự kiện dựa trên EVENT_DB.
- Khi người dùng đã cung cấp dữ liệu riêng trong prompt, ưu tiên dữ liệu trong prompt của người dùng.
- Không tự bịa thời gian, địa điểm, link, số lượng hoặc trạng thái.

QUY TẮC:
- Trả lời bằng tiếng Việt.
- Không dùng dấu **.
- Nếu không có dữ liệu phù hợp, nói: "Hiện tại hệ thống chưa cập nhật thông tin này."
- Với yêu cầu tạo JSON, chỉ trả JSON hợp lệ, không markdown.

DỊCH TRẠNG THÁI:
PUBLISHED => Đã công bố
ONGOING => Đang diễn ra
COMPLETED => Đã kết thúc
CANCELLED => Đã hủy
DRAFT => Bản nháp

${isExtraction ? `
CHẾ ĐỘ TRÍCH XUẤT:
- Chỉ trả JSON hợp lệ.
- Không markdown.
- Không giải thích thêm.
` : ""}

${dbContext ? `
EVENT_DB:
${dbContext}
` : ""}

${safePdfContext ? `
TÀI LIỆU PDF/DOCX:
${safePdfContext}
` : ""}

Hãy trả lời dựa trên dữ liệu có sẵn.
`.trim();
};

const buildOllamaSystemInstruction = ({
  eventDbContext,
  pdfContext,
  isExtraction,
  shouldUseEventDb,
}) => {
  const dbContext =
    shouldUseEventDb
      ? toSafeString(eventDbContext) || "Hiện tại hệ thống chưa có dữ liệu sự kiện."
      : "";

  const safePdfContext = toSafeString(pdfContext);

  return `
Bạn là trợ lý AI của hệ thống sự kiện IUH.

QUY TẮC:
- Trả lời tiếng Việt, ngắn gọn, rõ ràng.
- Không dùng dấu **.
- Không tự bịa thông tin sự kiện.
- Nếu người dùng đã cung cấp dữ liệu trong prompt, ưu tiên dữ liệu đó.
- Nếu hỏi sự kiện và có EVENT_DB, chỉ dùng EVENT_DB.
- Nếu không có dữ liệu phù hợp, trả lời: "Hiện tại hệ thống chưa cập nhật thông tin này."
- Nếu yêu cầu JSON, chỉ trả JSON hợp lệ, không markdown.

FORMAT SỰ KIỆN NGẮN:
🏷️ Tên sự kiện: [TITLE]
⏳ Hạn đăng ký: [REGISTRATION_DEADLINE]
📅 Bắt đầu: [START_TIME]
📅 Kết thúc: [END_TIME]
📍 Địa điểm: [LOCATION]
📌 Trạng thái: [STATUS]
🔗 Chi tiết: https://fitiuh-events.io.vn/events/[ID]

${isExtraction ? "CHẾ ĐỘ JSON: Chỉ trả JSON hợp lệ." : ""}

${dbContext ? `
EVENT_DB:
${dbContext}
` : ""}

${safePdfContext ? `
PDF/DOCX:
${safePdfContext}
` : ""}
`.trim();
};

const cleanJsonResponse = (text) => {
  if (!text) return "";
  let clean = text.trim();

  // Remove markdown code blocks if present
  if (clean.includes("```")) {
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      clean = match[1].trim();
    } else {
      // If we can't find a proper block, just strip the backticks
      clean = clean.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    }
  }

  // Remove any leading/trailing text that isn't part of the JSON object/array
  const firstBrace = clean.indexOf("{");
  const firstBracket = clean.indexOf("[");
  const lastBrace = clean.lastIndexOf("}");
  const lastBracket = clean.lastIndexOf("]");

  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = lastBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = lastBracket;
  }

  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.substring(start, end + 1);
  }

  return clean;
};

const tryRepairTruncatedJson = (json) => {
  if (!json || typeof json !== "string") return json;
  let trimmed = cleanJsonResponse(json);

  // Basic attempt to close unclosed strings and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === '"' && (i === 0 || trimmed[i - 1] !== '\\')) {
      inString = !inString;
    }
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets--;
    }
  }

  let repaired = trimmed;

  if (inString) {
    repaired += '"';
  }

  repaired = repaired.trim().replace(/,$/, "");

  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  return repaired;
};

const askGemini = async ({ systemInstruction, userPrompt, isExtraction }) => {
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Gemini] Đang thử model: ${modelName}`);

      const model = getGeminiModel(modelName, isExtraction);

      if (!model) {
        console.warn(`[Gemini] Model ${modelName} không khởi tạo được`);
        continue;
      }

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nUser: ${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: isExtraction ? 4096 : 2048,
          temperature: isExtraction ? 0.1 : 0.7,
        },
      });

      let reply = result.response.text();
      if (isExtraction) {
        reply = tryRepairTruncatedJson(reply);
      }

      return {
        provider: "gemini",
        model: modelName,
        reply: reply,
      };
    } catch (error) {
      console.warn(`[Gemini] Model ${modelName} thất bại: ${error.message}`);

      if (isLimitError(error)) {
        console.warn(`[Gemini] Model ${modelName} hết quota/rate limit`);
      }
    }
  }

  return null;
};

const askOllama = async ({ systemInstruction, userPrompt, isExtraction }) => {
  console.log("Using Ollama fallback...");

  const modelName = OLLAMA_MODEL || "qwen2.5:3b";

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        stream: false,
        keep_alive: "30m",
        options: {
          temperature: isExtraction ? 0.1 : 0.3,
          num_ctx: Number(process.env.OLLAMA_NUM_CTX) || 8192,
          num_predict: isExtraction ? 4096 : 1024,
          top_k: 20,
          top_p: 0.8,
          repeat_penalty: 1.15,
          num_thread: Number(process.env.OLLAMA_NUM_THREAD) || 4,
          stop: ["User:", "System:", "Assistant:", "Người dùng:"],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama error ${response.status}: ${errorText || response.statusText}`
      );
    }

    const data = await response.json();

    let reply = (data.message?.content || "")
      .replace(/^assistant\s*:/i, "")
      .replace(/^trợ lý\s*:/i, "")
      .replace(/\*\*/g, "")
      .trim();

    if (isExtraction) {
      reply = tryRepairTruncatedJson(reply);
    }

    return {
      provider: "ollama",
      model: modelName,
      reply: reply || "Hiện tại hệ thống chưa cập nhật thông tin này.",
    };
  } catch (err) {
    console.error("Ollama Connection Error:", err.message);

    return {
      provider: "error",
      model: modelName,
      reply: `Lỗi kết nối AI Ollama: ${err.message}`,
    };
  }
};

const chatWithAI = async ({
  userPrompt,
  pdfContext = "",
  isExtraction = false,
  accountId = null,
}) => {
  console.log(`[AI-Process] Nhận yêu cầu - Trích xuất: ${isExtraction}`);

  if (isPlanningRequest(userPrompt)) {
    console.log("[AI-Planning] Phát hiện yêu cầu lập kế hoạch sự kiện. Kích hoạt luồng 14 bước...");
    return await runSmartPlanningPipeline(userPrompt, accountId);
  }

  const externalDataPrompt = isExternalDataPrompt(userPrompt);
  const eventQuery = isEventQuery(userPrompt);

  const shouldUseEventDb = eventQuery && !externalDataPrompt;

  let eventDbContext = "";

  if (shouldUseEventDb) {
    // Nếu có accountId, chúng ta nên load lại để lấy thống kê cá nhân hóa
    if (accountId) {
      console.log(`[AI-Cache] Đang tải dữ liệu cá nhân hóa cho Account: ${accountId}`);
      eventDbContext = await loadEventDataOnce(accountId);
    } else {
      eventDbContext = getEventCache();
      if (!eventDbContext || eventDbContext.includes("chưa có dữ liệu")) {
        console.log("[AI-Cache] Cache trống, đang tải lại dữ liệu sự kiện...");
        eventDbContext = await loadEventDataOnce();
      }
    }
    
    eventDbContext = pickRelevantEventsFromCache(eventDbContext, userPrompt, 10);
  }

  const geminiSystemInstruction = buildGeminiSystemInstruction({
    eventDbContext,
    pdfContext,
    isExtraction,
    shouldUseEventDb,
  });

  const ollamaSystemInstruction = buildOllamaSystemInstruction({
    eventDbContext,
    pdfContext,
    isExtraction,
    shouldUseEventDb,
  });

  console.log(
    `[AI-Context] shouldUseEventDb=${shouldUseEventDb}, externalDataPrompt=${externalDataPrompt}`
  );

  console.log("[AI-Orchestrator] Đang thử kết nối Gemini...");

  const geminiResult = await askGemini({
    systemInstruction: geminiSystemInstruction,
    userPrompt,
    isExtraction,
  });

  if (geminiResult) {
    console.log(`[AI-Success] Gemini phản hồi thành công (${geminiResult.model})`);
    return geminiResult;
  }

  console.log("[AI-Fallback] Gemini thất bại hoặc hết lượt. Đang chuyển sang Ollama...");

  const ollamaResult = await askOllama({
    systemInstruction: ollamaSystemInstruction,
    userPrompt,
    isExtraction,
  });

  console.log(`[AI-Result] Kết quả từ ${ollamaResult.provider} (${ollamaResult.model})`);

  return ollamaResult;
};

const generateEmbedding = async (text) => {
  if (!text) return [];

  try {
    if (genAI && GEMINI_API_KEY) {
      for (const modelName of GEMINI_EMBEDDING_MODELS) {
        try {
          console.log(
            `[Gemini-Embedding] Đang thử: ${modelName}`
          );

          const model = genAI.getGenerativeModel({
            model: modelName,
          });

          const result = await model.embedContent({
            content: { parts: [{ text }] },
            outputDimensionality: 768
          });

          const embedding =
            result?.embedding?.values || [];

          if (embedding.length > 0) {
            return embedding;
          }
        } catch (error) {
          console.warn(
            `[Gemini-Embedding] ${modelName} thất bại:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.warn(
      "[Gemini-Embedding] Tổng lỗi:",
      error.message
    );
  }

  try {
    console.log("[Ollama-Embedding] Fallback...");

    const response = await fetch(
      `${OLLAMA_URL}/api/embeddings`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
          prompt: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Ollama embedding error: ${response.status}`
      );
    }

    const data = await response.json();

    return data.embedding || [];
  } catch (error) {
    console.error(
      "[Ollama-Embedding] Thất bại:",
      error.message
    );

    return [];
  }
};

const parseModelfile = (content) => {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let from = "";
  let system = "";
  const parameters = {};
  
  let inSystemBlock = false;
  let systemLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (inSystemBlock) {
      if (line.endsWith('"""')) {
        const lastPart = line.substring(0, line.length - 3);
        if (lastPart) systemLines.push(lastPart);
        inSystemBlock = false;
      } else {
        systemLines.push(lines[i]);
      }
      continue;
    }
    
    if (line.startsWith("FROM ")) {
      from = line.substring(5).trim();
    } else if (line.startsWith('SYSTEM """')) {
      inSystemBlock = true;
      const firstPart = lines[i].substring(lines[i].indexOf('"""') + 3);
      if (firstPart) systemLines.push(firstPart);
    } else if (line.startsWith('SYSTEM "')) {
      if (line.endsWith('"') && line !== 'SYSTEM "') {
        system = line.substring(8, line.length - 1);
      } else {
        inSystemBlock = true;
      }
    } else if (line.startsWith("PARAMETER ")) {
      const parts = line.substring(10).trim().split(/\s+/);
      if (parts.length >= 2) {
        const paramName = parts[0];
        let paramValue = parts.slice(1).join(" ");
        
        if (paramValue.startsWith('"') && paramValue.endsWith('"')) {
          paramValue = paramValue.substring(1, paramValue.length - 1);
        }
        
        const numericVal = Number(paramValue);
        const resolvedVal = !isNaN(numericVal) && paramValue.trim() !== "" ? numericVal : paramValue;
        
        if (parameters[paramName]) {
          if (Array.isArray(parameters[paramName])) {
            parameters[paramName].push(resolvedVal);
          } else {
            parameters[paramName] = [parameters[paramName], resolvedVal];
          }
        } else {
          parameters[paramName] = resolvedVal;
        }
      }
    }
  }
  
  if (systemLines.length > 0) {
    system = systemLines.join("\n").trim();
  }
  
  return { from, system, parameters };
};

const trainOllamaModel = async () => {
  const fs = require("fs");
  const path = require("path");

  console.log("[Ollama-Train] Bắt đầu tạo mô hình tùy chỉnh (event-assistant)...");
  try {
    const modelfilePath = path.join(__dirname, "../../Modelfile");
    if (!fs.existsSync(modelfilePath)) {
      throw new Error(`Không tìm thấy file Modelfile tại đường dẫn: ${modelfilePath}`);
    }
    let modelfileContent = fs.readFileSync(modelfilePath, "utf8");
    // Chuẩn hóa ký tự xuống dòng từ CRLF sang LF và xóa BOM nếu có
    modelfileContent = modelfileContent.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

    const parsed = parseModelfile(modelfileContent);
    const payload = {
      model: "event-assistant",
      from: parsed.from || undefined,
      system: parsed.system || undefined,
      parameters: Object.keys(parsed.parameters).length > 0 ? parsed.parameters : undefined,
      modelfile: modelfileContent, // Tương thích ngược với các phiên bản Ollama cũ hơn
      stream: false,
    };

    const response = await fetch(`${OLLAMA_URL}/api/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Lỗi từ Ollama Server: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    console.log("[Ollama-Train] Hoàn thành tạo mô hình:", result);
    return {
      success: true,
      message: "Đã tạo mô hình tùy chỉnh event-assistant thành công!",
      data: result,
    };
  } catch (err) {
    console.error("[Ollama-Train] Lỗi:", err.message);
    return {
      success: false,
      message: `Lỗi khi tạo mô hình tùy chỉnh: ${err.message}`,
    };
  }
};

module.exports = {
  chatWithAI,
  generateEmbedding,
  runSmartPlanningPipeline,
  trainOllamaModel,
};