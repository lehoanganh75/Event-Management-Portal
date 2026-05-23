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
router.post("/learning", chatController.handleFeedbackLearning);
router.post("/planning/raw-text", chatController.handlePlanningRawText);
router.post("/planning/template", chatController.handlePlanningTemplate);
router.post("/planning/train", chatController.handlePlanningTrain);

module.exports = router;
