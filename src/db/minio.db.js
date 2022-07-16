const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_URL,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

module.exports = minioClient;
