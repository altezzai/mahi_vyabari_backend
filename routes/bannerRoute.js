// src/routes/banner.routes.js
const { Router } = require("express");
const router = Router();
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const bannerController = require("../controllers/bannerController");
const { uploadBannerImages } = require("../middleware/multer");
const multerInstance = require("../middleware/upload");

const banner_uploadFields = [
  { name: "banner_image_small", maxCount: 1 },
  { name: "banner_image_large", maxCount: 1 },
];

router.post(
  "/add-banner",
  // userAuth,
  // authorizeRoles("admin"),
  // uploadBannerImages,
  multerInstance.fields(banner_uploadFields),
  bannerController.uploadBanners
);
router.put(
  "/update/:id",
  // userAuth,
  // authorizeRoles("admin"),
  // uploadBannerImages,
  multerInstance.fields(banner_uploadFields),
  bannerController.updateBanner
);
router.get(
  "/get-all",
  // userAuth,
  // authorizeRoles("admin"),
  bannerController.getAllBannersAdmin
);
router.get("/latest-by-type", bannerController.getLatestBannersByType);
router.patch(
  "/soft-delete/:id",
  // userAuth,
  // authorizeRoles("admin"),
  bannerController.softDeleteBanner
);
router.patch(
  "/restore-banner/:id",
  // userAuth,
  // authorizeRoles("admin"),
  bannerController.restoreBanner
);
router.delete(
  "/hard-delete/:id",
  // userAuth,
  // authorizeRoles("admin"),
  bannerController.hardDeleteBanner
);

module.exports = router;
