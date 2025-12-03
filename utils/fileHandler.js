const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const UPLOAD_PATH = process.env.UPLOAD_PATH;
const logger = require("../utils/logger");
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
    .rotate()
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
    if (
      files[fieldName] &&
      Array.isArray(files[fieldName]) &&
      files[fieldName].length > 0
    ) {
      console.log(
        `Found ${files[fieldName].length} file(s) for ${fieldName}, adding to processing queue.`
      );
      processedFiles[fieldName] = [];
      for (const file of files[fieldName]) {
        const resizeOptions = processingConfig[fieldName];
        const originalName = file.originalname;

        const promise = processImage(
          file.path,
          resizeOptions,
          subfolder,
          originalName
        ).then((result) => {
          processedFiles[fieldName].push(result);
        });
        processingPromises.push(promise);
      }
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
    const fileArray = processedFiles[fieldName];
    if (Array.isArray(fileArray)) {
      for (const file of fileArray) {
        if (file && file.filename) {
          const filePath = path.join(UPLOAD_PATH, subfolder, file.filename);
          cleanupPromises.push(
            fs.promises
              .unlink(filePath)
              .catch((err) =>
                console.error("Cleanup failed for file:", filePath, err.message)
              )
          );
        }
      }
    }
  }
  await Promise.all(cleanupPromises).catch(console.error);
  console.log(`Cleanup for "${subfolder}" complete.`);
  logger.info(`Cleanup for "${subfolder}" complete.`);
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
    logger.error("Error in deleteFile: " + err.message);
    console.error("Error cleaning up" + filename + " files:", err);
  }
};

const compressAndSaveFile = async (file, uploadPath) => {
  try {
    const date = Date.now() + "-";
    let processedFileName = `${date}${file.originalname}`;
    let processedFile = file.buffer;

    const ext = path.extname(file.originalname).toLowerCase();

    if (file.mimetype.startsWith("image")) {
      processedFileName = `${date}${file.originalname.split(".")[0]}.jpg`;
      processedFile = await sharp(file.buffer)
        .rotate()
        .jpeg({ quality: 30 })
        .toBuffer();
    }
    const filePath = path.join(uploadPath, processedFileName);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    fs.writeFileSync(filePath, processedFile);

    return processedFileName;
  } catch (error) {
    logger.error("Error in compressAndSaveFile: " + error.message);
    console.error("Error processing file:", error);
    throw new Error("Error processing file");
  }
};
module.exports = {
  processImageFields,
  cleanupFiles,
  deleteFileWithFolderName,
  processImage,
  compressAndSaveFile,
};
