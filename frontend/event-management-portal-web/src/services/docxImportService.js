import mammoth from "mammoth";
import axios from "axios";

const API_BASE_URL = "http://localhost:8082/api/v1/chat";

export const extractDataFromDocx = async (file) => {
  try {
    // 1. Convert Docx to raw text using mammoth
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text || text.trim().length < 10) {
      throw new Error("File docx không chứa đủ nội dung để phân tích.");
    }

    // 2. Send text to backend for AI extraction
    const response = await axios.post(`${API_BASE_URL}/extract-from-text`, text, {
      headers: {
        'Content-Type': 'text/plain'
      },
      timeout: 30000 // 30 seconds timeout
    });

    if (response.data.code === 1000) {
      return {
        rawText: text,
        extracted: response.data.result
      };
    } else {
      // If AI extraction fails, still return raw text
      return {
        rawText: text,
        extracted: null,
        error: response.data.message
      };
    }
  } catch (error) {
    console.error("Error importing docx:", error);
    throw error;
  }
};
