const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload folder exists
const ensureDirectoryExists = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

// Reusable uploader
const createFileUploader = ({
  folder = "uploads", // default folder
  fieldName = "file", // default field name
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = /\.(jpeg|jpg|png|webp|pdf|doc|docx|xls|xlsx)$/i,
} = {}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "..", folder);
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX."));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  }).single(fieldName); // returns middleware for a single file
};

module.exports = createFileUploader;
