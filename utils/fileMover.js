let fs = require("fs");
const path = require("path");

// Ensure directory exists
const ensureDirectoryExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

/**
 * Moves a file to the recycle bin folder (e.g., /uploads/recyclebin/invoices/)
 * @param {string} fileUrlOrPath - Full URL or relative path to the existing file
 * @param {string} newFolder - Folder inside recyclebin (e.g., "invoices", "purchase-orders")
 * @returns {string} Relative path to the moved file
 */
const moveFileToRecycleBin = (fileUrlOrPath, newFolder) => {
  // Extract file name from URL or path
  const fileName = path.basename(fileUrlOrPath);

  // Source path in filesystem
  const currentPath = path.join(process.cwd(), "uploads", newFolder, fileName);

  if (!fs.existsSync(currentPath)) {
    throw new Error(`File not found: ${currentPath}`);
  }

  // Destination path inside recyclebin
  const recycleBinDir = path.join(process.cwd(), "uploads", "recycle-bin", newFolder);
  ensureDirectoryExists(recycleBinDir);

  const newPath = path.join(recycleBinDir, fileName);

  try {
    fs.renameSync(currentPath, newPath); // Move (fast)
  } catch (err) {
    if (err.code === "EXDEV") {
      // Cross-device move fallback
      fs.copyFileSync(currentPath, newPath);
      fs.unlinkSync(currentPath);
    } else {
      throw err;
    }
  }

  return path.relative(process.cwd(), newPath); // Relative for DB
};

/**
 * Restores a file from the recycle bin back to its original uploads folder
 * @param {string} recycleBinPath - Relative path of file in recycle bin (e.g., "uploads/recyclebin/invoices/file.pdf")
 * @param {string} destinationFolder - Folder inside uploads to restore to (e.g., "invoices", "purchase-orders")
 * @returns {string} Relative path to restored file
 */
 const moveFileFromRecycleBin = (recycleBinPath, destinationFolder, baseUrl) => {
  const fileName = path.basename(recycleBinPath);

  // Absolute path to current file
  const currentPath = path.join(process.cwd(), recycleBinPath);
  if (!fs.existsSync(currentPath)) {
    throw new Error(`File not found in recycle bin: ${currentPath}`);
  }

  // Absolute path to destination folder
  const restoreDir = path.join(process.cwd(), "uploads", destinationFolder);
  ensureDirectoryExists(restoreDir);

  const newPath = path.join(restoreDir, fileName);

  // Move or copy file
  try {
    fs.renameSync(currentPath, newPath);
  } catch (err) {
    if (err.code === "EXDEV") {
      fs.copyFileSync(currentPath, newPath);
      fs.unlinkSync(currentPath);
    } else {
      throw err;
    }
  }

  // Return full public URL
  return `${baseUrl}/uploads/${destinationFolder}/${fileName}`;
};

module.exports = {
  moveFileToRecycleBin,
  moveFileFromRecycleBin,
};
