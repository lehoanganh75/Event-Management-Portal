const crypto = require("crypto");
const { OLLAMA_MODEL } = require("../config/ai");
const { routeLlmCall } = require("../llm/llmRouter");
const { cleanJsonResponse, tryRepairTruncatedJson } = require("../validators/jsonValidator");
const { validatePlan } = require("../validators/planValidator");
const { selfNormalizePlan } = require("../validators/timeValidator");
const { logPlanningAudit } = require("../tools/auditTool");
const {
  calculateTextSimilarity,
  mineSessionTemplate,
  queryCandidateEvents,
  queryFeedbacksForEvent,
  querySessionsForEvent
} = require("../tools/eventTool");

const run = async (userPrompt, accountId = null, template = null) => {
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
  const intentResult = await routeLlmCall({
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
    candidateEvents = await queryCandidateEvents();
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
      const feedbacks = await queryFeedbacksForEvent(ev.id);
      ev.feedbacks = feedbacks || [];
    } catch (e) {
      console.error(`[SmartPlanning] Error loading feedbacks for event ${ev.id}:`, e.message);
      ev.feedbacks = [];
    }

    try {
      const sessions = await querySessionsForEvent(ev.id);
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
  const geminiOutput = await routeLlmCall({
    systemInstruction,
    userPrompt: planningPrompt,
    isExtraction: true
  });

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

    const repairOutput = await routeLlmCall({
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

  await logPlanningAudit({
    sessionId,
    userPrompt,
    intent,
    selectedEvents,
    validationErrors,
    repairAttempts,
    finalPlan
  });

  return {
    provider: geminiOutput ? geminiOutput.provider : "error",
    model: geminiOutput ? geminiOutput.model : (OLLAMA_MODEL || "qwen2.5:3b"),
    reply: JSON.stringify(finalPlan)
  };
};

module.exports = {
  run,
};
