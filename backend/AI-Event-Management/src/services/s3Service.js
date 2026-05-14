const crypto = require("crypto");
const { s3, BUCKET_NAME } = require("../config/s3");

const uploadToS3 = async (file) => {
  if (!file) {
    throw new Error("File is required");
  }

  const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

  const key = `ai-docs/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();

  return {
    bucket: BUCKET_NAME,
    key,
    url: result.Location,
  };
};

module.exports = {
  uploadToS3,
};