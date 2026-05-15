require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://ollama:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "qwen2.5:3b";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-3-flash-preview",
];

const GEMINI_EMBEDDING_MODELS = [
  "gemini-embedding-001",
  "gemini-embedding-2-preview",
];

let genAI = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  console.log("Gemini AI được khởi tạo");
} else {
  console.warn(
    "Không tìm thấy GEMINI_API_KEY -> sử dụng Ollama"
  );
}

function getGeminiModel(
  modelName = GEMINI_MODELS[0],
  isExtraction = false
) {
  if (!genAI) return null;

  return genAI.getGenerativeModel({
    model: modelName,

    generationConfig: {
      temperature: isExtraction ? 0.1 : 0.7,

      maxOutputTokens: isExtraction
        ? 4096
        : 2048,
    },
  });
}

async function generateGeminiEmbedding(text) {
  if (!genAI || !text) return [];

  for (const modelName of GEMINI_EMBEDDING_MODELS) {
    try {
      console.log(
        `[Gemini-Embedding] Đang thử: ${modelName}`
      );

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const result = await model.embedContent(text);

      return result.embedding.values || [];
    } catch (error) {
      console.warn(
        `[Gemini-Embedding] ${modelName} thất bại:`,
        error.message
      );
    }
  }

  return [];
}

async function generateOllamaEmbedding(text) {
  try {
    const response = await fetch(
      `${OLLAMA_URL}/api/embeddings`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: OLLAMA_MODEL,
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
      "[Ollama-Embedding] Lỗi:",
      error.message
    );

    return [];
  }
}

async function generateEmbedding(text) {
  if (!text) return [];

  if (genAI) {
    const geminiEmbedding =
      await generateGeminiEmbedding(text);

    if (
      Array.isArray(geminiEmbedding) &&
      geminiEmbedding.length > 0
    ) {
      return geminiEmbedding;
    }
  }

  console.warn(
    "Gemini Embedding lỗi -> chuyển sang Ollama"
  );

  return await generateOllamaEmbedding(text);
}

function isGeminiLimitError(error) {
  const message =
    error?.message?.toLowerCase() || "";

  return (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("429") ||
    message.includes("too many requests")
  );
}

module.exports = {
  genAI,

  GEMINI_API_KEY,

  GEMINI_MODELS,

  GEMINI_EMBEDDING_MODELS,

  OLLAMA_URL,

  OLLAMA_MODEL,

  getGeminiModel,

  generateEmbedding,

  isGeminiLimitError,
};