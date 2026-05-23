require("dotenv").config();
const fs = require("fs");
const path = require("path");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const modelfilePath = path.join(__dirname, "../../Modelfile");

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

async function train() {
  console.log(`[Ollama-Train] Bắt đầu huấn luyện mô hình (event-assistant)...`);
  console.log(`[Ollama-Train] Modelfile: ${modelfilePath}`);
  
  if (!fs.existsSync(modelfilePath)) {
    console.error(`[Ollama-Train] Lỗi: Không tìm thấy file Modelfile tại: ${modelfilePath}`);
    process.exit(1);
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

  // Nếu OLLAMA_URL chứa 'ollama' (phổ biến trong cấu hình docker-compose), nhưng ta chạy local trên host,
  // thì 'ollama:11434' sẽ không thể resolve được. Chúng ta sẽ thử cả 'http://localhost:11434'.
  const urlsToTry = [OLLAMA_URL];
  if (OLLAMA_URL.includes("ollama:11434")) {
    urlsToTry.push("http://localhost:11434");
  }

  let lastError = null;
  let success = false;

  for (const url of urlsToTry) {
    try {
      console.log(`[Ollama-Train] Đang gửi yêu cầu tạo model tới: ${url}/api/create`);
      const response = await fetch(`${url}/api/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama Server trả về lỗi ${response.status}: ${errText}`);
      }

      const result = await response.json();
      console.log(`[Ollama-Train] Thành công! Kết quả:`, result);
      success = true;
      break;
    } catch (err) {
      console.warn(`[Ollama-Train] Gửi tới ${url} thất bại: ${err.message}`);
      lastError = err;
    }
  }

  if (!success) {
    console.error(`[Ollama-Train] Huấn luyện thất bại:`, lastError?.message);
    process.exit(1);
  }
}

train();
