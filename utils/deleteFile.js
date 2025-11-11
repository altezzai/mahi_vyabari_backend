const fs = require("fs");
const path = require("path");
const deleteFile = async (files) => {
  try {
    if (files.file) {
      const filePath = path.join("uploads/files/", files.file[0].filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
    if (files.cover_image) {
      const coverPath = path.join(
        "uploads/cover_images/",
        files.cover_image[0].filename
      );
      if (fs.existsSync(coverPath)) {
        await fs.promises.unlink(coverPath);
      }
    }
  } catch (err) {
    console.error("Error cleaning up files:", err);
  }
};
const deleteFileWithFolderName = async (uploadPath, filename) => {
  try {
    if (filename) {
      const filePath = path.join(uploadPath, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  } catch (err) {
    console.error("Error cleaning up" + filename + " files:", err);
  }
};
module.exports = { deleteFile, deleteFileWithFolderName };
