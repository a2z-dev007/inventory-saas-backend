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
const createImageUploader = ({
  folder = "uploads", // default folder
  fieldName = "image", // default field name
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = /jpeg|jpg|png|webp/,
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
    const isValidType =
      allowedTypes.test(ext) && allowedTypes.test(file.mimetype);
    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  }).single(fieldName); // returns middleware for a single file
};

module.exports = createImageUploader;
