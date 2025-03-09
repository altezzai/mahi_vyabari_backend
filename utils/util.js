const fs = require("fs");
const path = require("path");
const deletefile = async (files) => {
  //   console.log(files);
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
const deletefilewithfoldername = async (uploadPath, filename) => {
  try {
    if (file) {
      const filePath = path.join(uploadPath, filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  } catch (err) {
    console.error("Error cleaning up" + filename + " files:", err);
  }
};
module.exports = { deletefile, deletefilewithfoldername };
