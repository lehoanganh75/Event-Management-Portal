const { OLLAMA_URL, OLLAMA_MODEL } = require("../config/ai");
const { tryRepairTruncatedJson } = require("../validators/jsonValidator");
const fs = require("fs");
const path = require("path");

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
  console.log("[Ollama-Train] Bắt đầu tạo mô hình tùy chỉnh (event-assistant)...");
  try {
    const modelfilePath = path.join(__dirname, "../../Modelfile");
    if (!fs.existsSync(modelfilePath)) {
      throw new Error(`Không tìm thấy file Modelfile tại đường dẫn: ${modelfilePath}`);
    }
    let modelfileContent = fs.readFileSync(modelfilePath, "utf8");
    modelfileContent = modelfileContent.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

    const parsed = parseModelfile(modelfileContent);
    const payload = {
      model: "event-assistant",
      from: parsed.from || undefined,
      system: parsed.system || undefined,
      parameters: Object.keys(parsed.parameters).length > 0 ? parsed.parameters : undefined,
      modelfile: modelfileContent,
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
  askOllama,
  trainOllamaModel,
};
