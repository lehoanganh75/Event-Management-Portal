const express = require("express");
const router = express.Router();
const multer = require("multer");
const chatController = require("../controllers/chatController");
const uploadController = require("../controllers/uploadController");

// Cấu hình multer lưu vào RAM
const upload = multer({ storage: multer.memoryStorage() });

router.post("/chat", chatController.handleChat);
router.post("/embeddings", chatController.handleEmbedding);
router.post("/upload", upload.single("file"), uploadController.handleUpload);

module.exports = router;
