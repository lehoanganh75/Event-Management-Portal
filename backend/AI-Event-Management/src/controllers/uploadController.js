const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const { uploadToS3 } = require("../services/s3Service");
const { updatePdfContext } = require("./chatController");

const SUPPORTED_EXTENSIONS = ["pdf", "docx"];

const extractTextFromFile = async (fileBuffer, fileExtension) => {
  if (fileExtension === "pdf") {
    const data = await pdf(fileBuffer);
    return data.text;
  }

  if (fileExtension === "docx") {
    const result = await mammoth.extractRawText({
      buffer: fileBuffer,
    });

    return result.value;
  }

  throw new Error("Chỉ hỗ trợ file PDF hoặc DOCX");
};

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const fileBuffer = req.file.buffer;

    const originalName = req.file.originalname;

    const fileExtension = originalName
      .split(".")
      .pop()
      .toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).json({
        error: "Chỉ hỗ trợ file PDF hoặc DOCX",
      });
    }

    const extractedText = await extractTextFromFile(
      fileBuffer,
      fileExtension
    );

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: "Không trích xuất được nội dung từ file",
      });
    }

    const uploadedFile = await uploadToS3(req.file);

    const documentInfo = updatePdfContext(extractedText);

    return res.status(200).json({
      success: true,

      message: `${fileExtension.toUpperCase()} đã được tải lên S3 và xử lý thành công!`,

      file: {
        name: originalName,
        type: fileExtension,
        mimeType: req.file.mimetype,
        size: req.file.size,

        bucket: uploadedFile.bucket,
        key: uploadedFile.key,
        url: uploadedFile.url,
      },

      document: {
        textLength: extractedText.length,
        chunks: documentInfo?.chunks || 0,
        uploadedAt: documentInfo?.uploadedAt || null,
      },
    });
  } catch (error) {
    console.error("Upload Controller Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  handleUpload,
};