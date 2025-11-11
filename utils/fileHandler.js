// --- utils/imageProcessor.js ---
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const UPLOAD_PATH = process.env.UPLOAD_PATH;
const processImage = async (
  buffer,
  resizeOptions,
  subfolder = "",
  originalName = "file"
) => {
  const originalBaseName = path
    .parse(originalName)
    .name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = `${originalBaseName}-${uniqueSuffix}.webp`;
  const outputDir = path.join(UPLOAD_PATH, subfolder);
  const outputPath = path.join(outputDir, filename);

  await fs.promises.mkdir(outputDir, { recursive: true });

  await sharp(buffer)
    .resize(resizeOptions.width, resizeOptions.height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(outputPath);

  const url = path.posix.join("/uploads", subfolder, filename);

  return {
    filename: filename,
    url: url,
  };
};

const processImageFields = async (files, processingConfig, subfolder = "") => {
  if (!files || Object.keys(files).length === 0) {
    console.log("No files object found in request.");
    return {};
  }

  const processingPromises = [];
  const processedFiles = {};

  for (const fieldName in processingConfig) {
    if (files[fieldName] && files[fieldName][0]) {
      console.log(`Found ${fieldName}, adding to processing queue.`);

      const file = files[fieldName][0];
      const resizeOptions = processingConfig[fieldName];
      const originalName = file.originalname;
      const promise = processImage(
        file.buffer,
        resizeOptions,
        subfolder,
        originalName
      ).then((result) => {
        processedFiles[fieldName] = result;
      });
      processingPromises.push(promise);
    }
  }

  if (processingPromises.length === 0) {
    console.warn(
      "No matching files found for the given processing config. Check field names."
    );
  }

  await Promise.all(processingPromises);
  console.log("All images processed successfully.");

  return processedFiles;
};

const cleanupFiles = async (processedFiles, subfolder) => {
  if (!processedFiles) return;
  console.error(`Cleaning up files from "${subfolder}"...`);
  const cleanupPromises = [];
  for (const fieldName in processedFiles) {
    const file = processedFiles[fieldName];
    if (file && file.filename) {
      const filePath = path.join(UPLOAD_PATH, subfolder, file.filename);
      console.log("Deleting orphaned file:", filePath);
      cleanupPromises.push(
        fs.promises
          .unlink(filePath)
          .catch((err) =>
            console.error("Cleanup failed for file:", filePath, err.message)
          )
      );
    }
  }
  await Promise.all(cleanupPromises).catch(console.error);
  console.log(`Cleanup for "${subfolder}" complete.`);
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
module.exports = {
  processImageFields,
  cleanupFiles,
  deleteFileWithFolderName,
};
