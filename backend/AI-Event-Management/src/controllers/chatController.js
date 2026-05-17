const { chatWithAI } = require("../services/aiService");

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
    const { prompt } = req.body;

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

module.exports = {
  handleChat,
  handleEmbedding,
  updatePdfContext,
  getDocumentInfo,
};