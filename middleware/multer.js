const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = process.env.UPLOAD_PATH
const imageFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/jpeg") ||
    file.mimetype.startsWith("image/png") ||
    file.mimetype.startsWith("image/webp")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, or WebP are allowed."),
      false
    );
  }
};

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "";
    if (file.fieldname === "banner_image_large") {
      folder = "banner/large";
    } else if (file.fieldname === "banner_image_small") {
      folder = "banner/small";
    } else {
      folder = "others";
    }
   
    // const uploadPath = path.join(__dirname, `../public/uploads/${folder}`);
    // const uploadPathV = path.join('public','uploads',folder);
    // console.log(uploadPathV);
    const uploadPathFolder = path.join(uploadPath,folder);
    console.log(uploadPathFolder)

    fs.mkdir(uploadPathFolder, { recursive: true }, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null, uploadPathFolder);
    });
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, extension);
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, sanitizedName + "-" + uniqueSuffix + extension);
  },
});

const bannerUploader = multer({
  storage: bannerStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

module.exports = {
  uploadBannerImages: bannerUploader.fields([
    { name: "banner_image_large", maxCount: 1 },
    { name: "banner_image_small", maxCount: 1 },
  ]),

  // You can keep your other uploaders here if you still need them
  // uploadShopGallery: ...
  // uploadAvatar: ...
};
