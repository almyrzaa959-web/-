// ==========================================
// TITO - نظام تخزين الفيديوهات
// ==========================================

const {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand
} = require("@aws-sdk/client-s3");

const crypto = require("crypto");

// ==========================================
// إعدادات التخزين
// ==========================================

const endpoint = process.env.STORAGE_ENDPOINT || "storage:9000";

const storageClient = new S3Client({
  region: "us-east-1",

  endpoint: `http://${endpoint}`,

  forcePathStyle: true,

  credentials: {
    accessKeyId:
      process.env.STORAGE_ACCESS_KEY || "tito_storage",

    secretAccessKey:
      process.env.STORAGE_SECRET_KEY ||
      "tito_storage_password"
  }
});

const BUCKET =
  process.env.STORAGE_BUCKET || "tito-videos";

// ==========================================
// إنشاء مخزن الفيديوهات إذا لم يكن موجودًا
// ==========================================

async function initializeStorage() {

  try {

    await storageClient.send(
      new HeadBucketCommand({
        Bucket: BUCKET
      })
    );

    console.log(
      `مخزن الفيديوهات موجود: ${BUCKET}`
    );

  } catch (error) {

    try {

      await storageClient.send(
        new CreateBucketCommand({
          Bucket: BUCKET
        })
      );

      console.log(
        `تم إنشاء مخزن الفيديوهات: ${BUCKET}`
      );

    } catch (createError) {

      console.error(
        "تعذر إنشاء مخزن الفيديوهات:",
        createError.message
      );

    }

  }

}

// ==========================================
// رفع فيديو
// ==========================================

async function uploadVideo(
  buffer,
  originalName,
  contentType
) {

  const extension =
    originalName.includes(".")
      ? originalName
          .substring(
            originalName.lastIndexOf(".")
          )
          .toLowerCase()
      : "";

  const fileName =
    `videos/${Date.now()}-${crypto.randomUUID()}${extension}`;

  await storageClient.send(
    new PutObjectCommand({
      Bucket: BUCKET,

      Key: fileName,

      Body: buffer,

      ContentType:
        contentType || "video/mp4"
    })
  );

  const publicEndpoint =
    process.env.STORAGE_PUBLIC_URL ||
    "http://localhost:9000";

  const videoUrl =
    `${publicEndpoint}/${BUCKET}/${fileName}`;

  return {
    key: fileName,
    url: videoUrl
  };

}

// ==========================================
// تصدير الوظائف
// ==========================================

module.exports = {
  storageClient,
  initializeStorage,
  uploadVideo,
  BUCKET
};
