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
    throw new Error(`Missing environment variable: ${env}`);
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