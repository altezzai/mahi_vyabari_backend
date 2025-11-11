// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const mStorage = multer.memoryStorage();
// const upload = multer({
//   storage: mStorage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// });

// const fileFilter = (req, file, cb) => {
//   cb(null, true);
// };

// const nUpload = multer({
//   storage: mStorage,
//   fileFilter,
// });

// module.exports = { upload, nUpload };

// --- middleware/imageUpload.js ---

const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type'), false);
  }
};


const multerInstance = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = multerInstance;