const { chatWithAI } = require("../services/aiService");
const { query } = require("../config/db");

const comparePlans = (orig, edited) => {
  const diffs = {};
  if (!orig || !edited) return diffs;

  const basicFields = [
    "title", "description", "eventTopic", "eventMode", "location",
    "maxParticipants", "registrationDeadline", "startTime", "endTime",
    "hasLuckyDraw", "checkInEnabled"
  ];

  basicFields.forEach(field => {
    if (orig[field] !== edited[field]) {
      diffs[field] = { original: orig[field], edited: edited[field] };
    }
  });

  const origItems = orig.programItems || [];
  const editedItems = edited.programItems || [];

  if (origItems.length !== editedItems.length) {
    diffs.programItemsCount = { original: origItems.length, edited: editedItems.length };
  }

  const itemDiffs = [];
  const maxLen = Math.max(origItems.length, editedItems.length);
  for (let i = 0; i < maxLen; i++) {
    const oItem = origItems[i];
    const eItem = editedItems[i];
    if (!oItem && eItem) {
      itemDiffs.push({ index: i, action: "added", item: eItem });
    } else if (oItem && !eItem) {
      itemDiffs.push({ index: i, action: "removed", item: oItem });
    } else if (oItem && eItem) {
      const itemDiff = {};
      ["title", "description", "room", "startTime", "endTime"].forEach(k => {
        if (oItem[k] !== eItem[k]) {
          itemDiff[k] = { original: oItem[k], edited: eItem[k] };
        }
      });
      if (Object.keys(itemDiff).length > 0) {
        itemDiffs.push({ index: i, action: "modified", diff: itemDiff });
      }
    }
  }

  if (itemDiffs.length > 0) {
    diffs.programItemsDetails = itemDiffs;
  }

  return diffs;
};

let documentStore = {
  rawText: "",
  chunks: [],
  uploadedAt: null,
};

function chunkText(text, chunkSize = 1200, overlap = 200) {
  if (!text) return [];

  const cleanText = text.replace(/\s+/g, " ").trim();

  const chunks = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);

    chunks.push({
      index: chunks.length,
      content: cleanText.slice(start, end),
    });

    start += chunkSize - overlap;
  }

  return chunks;
}

function searchRelevantChunks(question, limit = 4) {
  if (!question || documentStore.chunks.length === 0) {
    return [];
  }

  const keywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  const scored = documentStore.chunks.map((chunk) => {
    const content = chunk.content.toLowerCase();

    let score = 0;

    keywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        score++;
      }
    });

    return {
      ...chunk,
      score,
    };
  });

  return scored
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const handleChat = async (req, res) => {
  try {
    let { prompt } = req.body;

    if (!prompt) {
      if (req.body.statsJson) {
        prompt = `Hãy phân tích dữ liệu thống kê sự kiện sau và đưa ra nhận xét chuyên sâu: ${req.body.statsJson}`;
      } else if (req.body.text && req.body.isExtraction) {
        prompt = `Trích xuất thông tin sự kiện từ văn bản sau và trả về DUY NHẤT định dạng JSON. 
        Yêu cầu các trường: title, subject, suggestedStartTime, suggestedEndTime, suggestedLocation, estimatedParticipants, programItems (mảng các session).
        Văn bản: ${req.body.text}`;
      } else if (req.body.eventDetails) {
        prompt = `Dựa trên thông tin sự kiện sau, hãy viết một bài đăng truyền thông (Facebook/LinkedIn) hấp dẫn. 
        Yêu cầu: Trả về JSON có cấu trúc {"title": "...", "content": "..."}.
        Dữ liệu: ${req.body.eventDetails}`;
      }
    }

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const isExtraction =
      req.body.isExtraction !== undefined
        ? req.body.isExtraction
        : (prompt.includes("Trích xuất") || prompt.includes("JSON"));

    const relevantChunks = searchRelevantChunks(prompt);

    const pdfContext = relevantChunks
      .map((chunk) => chunk.content)
      .join("\n\n");

    const reply = await chatWithAI({
      userPrompt: prompt,
      pdfContext,
      isExtraction,
      accountId: req.body.accountId,
    });

    res.json({
      reply,

      contextInfo: {
        chunksUsed: relevantChunks.length,
        uploadedAt: documentStore.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

const updatePdfContext = (text) => {
  documentStore = {
    rawText: text,
    chunks: chunkText(text),
    uploadedAt: new Date(),
  };

  console.log(
    `PDF context updated. Chunks: ${documentStore.chunks.length}`
  );
};

const getDocumentInfo = () => {
  return {
    hasDocument: !!documentStore.rawText,
    chunks: documentStore.chunks.length,
    uploadedAt: documentStore.uploadedAt,
  };
};

const handleEmbedding = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    const embedding = await require("../services/aiService").generateEmbedding(text);
    res.json({ embedding });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleFeedbackLearning = async (req, res) => {
  try {
    const { eventId, originalPlan, editedPlan, rating } = req.body;

    if (!eventId) {
      return res.status(400).json({
        error: "eventId is required",
      });
    }

    const orig = typeof originalPlan === "string" ? JSON.parse(originalPlan) : originalPlan;
    const edited = typeof editedPlan === "string" ? JSON.parse(editedPlan) : editedPlan;

    const editedFields = comparePlans(orig, edited);

    await query(
      `INSERT INTO ai_planning_feedbacks (event_id, original_plan, edited_plan, edited_fields, rating)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(eventId),
        JSON.stringify(orig || null),
        JSON.stringify(edited || null),
        JSON.stringify(editedFields || null),
        rating !== undefined ? Number(rating) : null
      ]
    );

    res.json({
      success: true,
      message: "Feedback learning logged successfully",
      editedFields,
    });
  } catch (error) {
    console.error("Feedback Learning Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const handlePlanningRawText = async (req, res) => {
  try {
    const { rawText, accountId } = req.body;

    if (!rawText) {
      return res.status(400).json({
        error: "rawText is required",
      });
    }

    const { runSmartPlanningPipeline } = require("../services/aiService");
    const reply = await runSmartPlanningPipeline(rawText, accountId);

    res.json({
      reply,
      contextInfo: {
        chunksUsed: 0,
        uploadedAt: null,
      },
    });
  } catch (error) {
    console.error("Planning RawText Controller Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const handlePlanningTemplate = async (req, res) => {
  try {
    const { templateId, userContext, accountId, template: bodyTemplate } = req.body;

    if (!templateId) {
      return res.status(400).json({
        error: "templateId is required",
      });
    }

    let template = null;
    const rows = await query(
      `SELECT template_name AS templateName, description, config_data AS configData 
       FROM event_templates 
       WHERE id = ? AND is_deleted = 0`,
      [templateId]
    );

    if (rows && rows.length > 0) {
      let configData = null;
      if (rows[0].configData) {
        try {
          configData = typeof rows[0].configData === "string" ? JSON.parse(rows[0].configData) : rows[0].configData;
        } catch (e) {
          console.error("Failed to parse template configData:", e.message);
        }
      }
      template = {
        id: templateId,
        templateName: rows[0].templateName,
        description: rows[0].description,
        configData
      };
    } else if (bodyTemplate) {
      console.log(`[Planning-Template] Template ${templateId} not found in DB, using fallback from body`);
      template = bodyTemplate;
    } else {
      return res.status(404).json({
        error: `Template with ID ${templateId} not found`,
      });
    }

    const userPrompt = `Lập kế hoạch sự kiện dựa trên mẫu "${template.templateName}". Mô tả mẫu: ${template.description}. Yêu cầu bổ sung: ${userContext || "Không có yêu cầu bổ sung"}`;

    const { runSmartPlanningPipeline } = require("../services/aiService");
    const reply = await runSmartPlanningPipeline(userPrompt, accountId, template);

    res.json({
      reply,
      contextInfo: {
        chunksUsed: 0,
        uploadedAt: null,
      },
    });
  } catch (error) {
    console.error("Planning Template Controller Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const handlePlanningTrain = async (req, res) => {
  try {
    const { trainOllamaModel } = require("../services/aiService");
    const result = await trainOllamaModel();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Planning Train Controller Error:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi hệ thống khi huấn luyện: ${error.message}`,
    });
  }
};

module.exports = {
  handleChat,
  handleEmbedding,
  updatePdfContext,
  getDocumentInfo,
  handleFeedbackLearning,
  handlePlanningRawText,
  handlePlanningTemplate,
  handlePlanningTrain,
};