// utils/uploadFile.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUploadMiddleware = (folderName = "general", fieldName = "file", maxSizeMB = 5) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, `../uploads/${folderName}`);
      fs.mkdirSync(uploadPath, { recursive: true }); // Ensure folder exists
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    }
  });

  const fileFilter = function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  }).single(fieldName);
};

module.exports = createUploadMiddleware;
