const AWS = require("aws-sdk");
const multer = require("multer");
const path = require("path");
// load environment variables
require("dotenv").config();

// Allowed file types with extensions and content types
const allowedFileTypes = [
  { extension: ".pdf", contentType: "application/pdf" },
  { extension: ".doc", contentType: "application/msword" },
  {
    extension: ".docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  { extension: ".xls", contentType: "application/vnd.ms-excel" },
  {
    extension: ".xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  { extension: ".txt", contentType: "text/plain" },
  { extension: ".jpg", contentType: "image/jpeg" },
  { extension: ".jpeg", contentType: "image/jpeg" },
  { extension: ".png", contentType: "image/png" },
  { extension: ".gif", contentType: "image/gif" },
  { extension: ".webp", contentType: "image/webp" },
];

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your Secret Access Key
  region: process.env.AWS_REGION, // Your AWS region
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME; // Your S3 bucket name

// Helper function to get content type based on extension
function getContentType(extension) {
  const fileType = allowedFileTypes.find(
    (type) => type.extension === extension.toLowerCase()
  );
  return fileType ? fileType.contentType : "application/octet-stream";
}

// Generate unique filename with proper extension
function generateFileName(
  originalName,
  folderName = "startup-documents",
  userId = null
) {
  const timestamp = Date.now();
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, extension);
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "_");

  if (userId) {
    return `${folderName}/${userId}/${sanitizedBaseName}_${timestamp}${extension}`;
  }
  return `${folderName}/${sanitizedBaseName}_${timestamp}${extension}`;
}

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowedFileTypes.some(
      (type) => type.extension === extension
    );

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${extension} is not allowed. Allowed types: ${allowedFileTypes
            .map((t) => t.extension)
            .join(", ")}`
        ),
        false
      );
    }
  },
});

// Upload file to AWS S3
const uploadToS3 = async (
  file,
  folderName = "startup-documents",
  userId = null
) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const fileName = generateFileName(file.originalname, folderName, userId);
    const extension = path.extname(file.originalname).toLowerCase();
    const contentType = getContentType(extension);

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
      // ACL: 'public-read', // Uncomment if you want files to be publicly accessible
    };

    s3.upload(uploadParams, (error, data) => {
      if (error) {
        console.error("Upload error:", error);
        reject(error);
        return;
      }

      const publicUrl = `https://${bucketName}.s3.${AWS.config.region}.amazonaws.com/${fileName}`;

      resolve({
        url: publicUrl, // S3 object URL
        s3Url: data.Location, // AWS S3 URL from response
        fileName: fileName,
        originalName: file.originalname,
        contentType: contentType,
        size: file.size,
        etag: data.ETag,
      });
    });
  });
};

// Helper function to get public URL
function getPublicUrl(fileName) {
  return `https://${bucketName}.s3.${AWS.config.region}.amazonaws.com/${fileName}`;
}

// Check if file exists in S3
async function checkFileExists(fileName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      return false;
    }
    console.error("Error checking file existence:", error);
    return false;
  }
}

// Delete file from S3
async function deleteFile(fileName) {
  try {
    const exists = await checkFileExists(fileName);
    if (!exists) {
      return { success: false, message: "File does not exist" };
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: fileName,
    };

    await s3.deleteObject(deleteParams).promise();
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, message: "Failed to delete file" };
  }
}

// Get file metadata from S3
async function getFileMetadata(fileName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    const metadata = await s3.headObject(params).promise();

    return {
      success: true,
      metadata: {
        name: fileName,
        size: metadata.ContentLength,
        contentType: metadata.ContentType,
        created: metadata.LastModified,
        updated: metadata.LastModified,
        etag: metadata.ETag,
        publicUrl: getPublicUrl(fileName),
      },
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    return { success: false, message: "Failed to get file metadata" };
  }
}

// Generate signed URL for private files (optional)
function getSignedUrl(fileName, expiresIn = 3600) {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: expiresIn, // URL expires in seconds (default 1 hour)
  };

  return s3.getSignedUrl("getObject", params);
}

module.exports = {
  upload,
  uploadToS3,
  getPublicUrl,
  checkFileExists,
  deleteFile,
  generateFileName,
  getFileMetadata,
  allowedFileTypes,
  getSignedUrl, // Additional function for signed URLs
};
