const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const mysql = require("mysql2/promise");

const MARIADB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3309,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "event_db"
};

const upload = multer({ dest: "uploads/" });
let pdfContext = ""; // Store PDF text for RAG

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route for uploading PDF or DOCX
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let extractedText = "";

    if (fileExtension === "pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (fileExtension === "docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Chỉ hỗ trợ file PDF hoặc DOCX" });
    }

    pdfContext = extractedText; // Update shared context
    console.log(`File ${fileExtension} parsed successfully. Length:`, pdfContext.length);

    // Remove temp file
    fs.unlinkSync(filePath);

    res.json({
      message: `${fileExtension.toUpperCase()} đã được tải lên và xử lý thành công!`,
      length: pdfContext.length
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Lỗi xử lý file" });
  }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log("✨ Gemini AI is enabled and ready.");
} else {
  console.log("⚠️ GEMINI_API_KEY not found. Falling back to local Ollama.");
}

// Function to fetch database context from MariaDB
async function getDatabaseContext() {
  let connection;
  try {
    connection = await mysql.createConnection(MARIADB_CONFIG);
    // Chỉ lấy 5 sự kiện đang diễn ra hoặc đã công bố (không lấy bản nháp)
    const [rows] = await connection.execute(
      "SELECT title, description, location, start_time FROM events WHERE status IN ('PUBLISHED', 'ONGOING', 'COMPLETED') ORDER BY created_at DESC LIMIT 5"
    );
    if (rows.length === 0) return "Hiện tại chưa có sự kiện nào trong hệ thống.";

    let context = "Dữ liệu từ hệ thống MariaDB (Sự kiện mới nhất):\n";
    rows.forEach(ev => {
      context += `- Sự kiện: ${ev.title}, Địa điểm: ${ev.location}, Ngày: ${ev.start_time}, Mô tả: ${ev.description}\n`;
    });
    return context;
  } catch (err) {
    console.error("MariaDB Context Error:", err);
    return "";
  } finally {
    if (connection) await connection.end();
  }
}

// Route for chat
app.post("/chat", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    if (!userPrompt) return res.status(400).json({ error: "Prompt is required" });

    const isExtraction = userPrompt.includes("Trích xuất thông tin sự kiện") || userPrompt.includes("JSON");
    const greetings = ["hello", "hi", "chào", "xin chào", "hey", "bonjour", "tạm biệt"];
    const isGreeting = greetings.some(g => userPrompt.toLowerCase().trim() === g);

    const eventKeywords = ["sự kiện", "event", "lịch", "đăng ký", "tham gia", "tổ chức", "diễn ra", "hội thảo", "workshop", "thông tin", "ở đâu", "khi nào"];
    const needsContext = eventKeywords.some(kw => userPrompt.toLowerCase().includes(kw)) || isExtraction;

    let dbContext = "";
    if (needsContext) {
      dbContext = await getDatabaseContext();
    }

    const systemInstruction = `Bạn là trợ lý AI chuyên gia của hệ thống Quản lý Sự kiện IUH.
Hãy trả lời ngắn gọn, thân thiện và chuyên nghiệp. 
${dbContext ? "Dữ liệu sự kiện hiện có:\n" + dbContext : ""}
${pdfContext ? "Nội dung tài liệu đính kèm:\n" + pdfContext.substring(0, 5000) : ""}
Nếu người dùng chào hỏi, hãy chào lại và giới thiệu ngắn gọn bạn có thể giúp gì (tìm sự kiện, giải đáp thắc mắc).
Nếu trích xuất JSON, hãy CHỈ trả về code JSON.`;

    let finalResponse = "";

    // --- CASE 1: USE GEMINI (TRY STABLE NAMES) ---
    if (genAI) {
      const modelsToTry = ["models/gemini-1.5-flash", "models/gemini-pro"];
      let success = false;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying Gemini AI (${modelName})...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(systemInstruction + "\n\nUser: " + userPrompt);
          finalResponse = result.response.text();
          success = true;
          break;
        } catch (geminiError) {
          console.warn(`Gemini (${modelName}) failed:`, geminiError.message);
        }
      }

      if (success) {
        return res.json({ reply: finalResponse });
      }
    }

    // --- CASE 2: OLLAMA CHAT API (Better Reasoning) ---
    console.log("Using Ollama Chat API...");
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama:11434";
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "event-assistant",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: isExtraction ? 0.1 : 0.7,
          num_ctx: 4096
        }
      })
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
    const data = await response.json();
    res.json({ reply: data.message.content });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI error: " + error.message });
  }
});

// Default route to serve the UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 AI server running at http://0.0.0.0:${PORT}`);
});
