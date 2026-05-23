require("dotenv").config();

const AWS = require("aws-sdk");

const requiredEnvs = [
  "REGION",
  "ACCESS_KEY_ID",
  "SECRET_ACCESS_KEY",
  "S3_BUCKET",
];

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    console.warn(`[CẢNH BÁO] Thiếu biến môi trường S3: ${env}. Tính năng upload ảnh có thể không hoạt động.`);
  }
});

AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3({
  s3ForcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET;

module.exports = {
  s3,
  BUCKET_NAME,
};