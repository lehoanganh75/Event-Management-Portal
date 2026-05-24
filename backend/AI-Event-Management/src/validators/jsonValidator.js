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

module.exports = {
  cleanJsonResponse,
  tryRepairTruncatedJson,
};
