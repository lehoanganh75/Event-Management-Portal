require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "event-assistant";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

let genAI = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log("Gemini AI được khởi tạo");
} else {
  console.warn("Không tìm thấy GEMINI_API_KEY -> chuyển sang sử dụng Ollama");
}

function getGeminiModel(modelName = GEMINI_MODELS[0], isExtraction = false) {
  if (!genAI) return null;

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: isExtraction ? 0.1 : 0.7,
      maxOutputTokens: 2048,
    },
  });
}

function isGeminiLimitError(error) {
  const message = error?.message?.toLowerCase() || "";

  return (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("429") ||
    message.includes("too many requests")
  );
}

async function askOllama(systemInstruction, userPrompt, isExtraction = false) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
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
      options: {
        temperature: isExtraction ? 0.1 : 0.7,
        num_ctx: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    provider: "ollama",
    model: OLLAMA_MODEL,
    reply: data.message.content,
  };
}

async function askAI(systemInstruction, userPrompt, isExtraction = false) {
  if (genAI) {
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Đang thử Gemini model: ${modelName}`);

        const model = getGeminiModel(modelName, isExtraction);

        const result = await model.generateContent(
          `${systemInstruction}\n\nUser Prompt: ${userPrompt}`
        );

        return {
          provider: "gemini",
          model: modelName,
          reply: result.response.text(),
        };
      } catch (error) {
        console.warn(`Gemini ${modelName} lỗi:`, error.message);

        if (isGeminiLimitError(error)) {
          console.warn(`Gemini ${modelName} hết quota/rate limit`);
          continue;
        }

        continue;
      }
    }
  }

  console.warn("Tất cả Gemini model lỗi hoặc hết limit -> chuyển sang Ollama");

  return await askOllama(systemInstruction, userPrompt, isExtraction);
}

module.exports = {
  genAI,
  getGeminiModel,
  askAI,
  askOllama,
  GEMINI_MODELS,
  OLLAMA_URL,
  OLLAMA_MODEL,
};