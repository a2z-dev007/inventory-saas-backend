const fs = require("fs");
const path = require("path");

// Ensure directory exists
const ensureDirectoryExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

/**
 * Moves a file to the recycle bin folder (e.g., /recyclebin/invoices/)
 * @param {string} currentPath - Path to the existing file
 * @param {string} newFolder - Folder inside recyclebin to move to (e.g., "invoices")
 * @returns {string} newPath (relative path to the moved file)
 */
const moveFileToRecycleBin = (currentPath, newFolder) => {
  const fileName = path.basename(currentPath);
  const newDir = path.join(__dirname, "..", "recyclebin", newFolder);
  ensureDirectoryExists(newDir);

  const newPath = path.join(newDir, fileName);

  fs.renameSync(currentPath, newPath); // moves the file
  return path.relative(path.join(__dirname, ".."), newPath); // returns relative path for DB or logging
};

const moveFileFromRecycleBin = (currentPath, destinationFolder) => {
  const fileName = path.basename(currentPath);
  const newDir = path.join(__dirname, "..", destinationFolder);
  ensureDirectoryExists(newDir);

  const newPath = path.join(newDir, fileName);

  fs.renameSync(currentPath, newPath);

  return path.relative(path.join(__dirname, ".."), newPath); // for DB
};

module.exports = {
  moveFileToRecycleBin,
  moveFileFromRecycleBin,
};
