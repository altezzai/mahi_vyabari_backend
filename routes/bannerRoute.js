// src/routes/banner.routes.js
const { Router } = require("express");
const router = Router();
const bannerController = require("../controllers/bannerController");

router.post(
  "/upload-banner",
  bannerController.upload,
  bannerController.uploadBanners
);
router.patch(
  "/update/:id",
  bannerController.uploadSingle,
  bannerController.updateBanner
);
router.get('/get-all', bannerController.getAllBannersAdmin);
router.get("/latest-by-type", bannerController.getLatestBannersByType);
router.patch("/soft-delete/:id", bannerController.softDeleteBanner);
router.patch("/restore-banner/:id", bannerController.restoreBanner);
router.delete("/hard-delete/:id", bannerController.hardDeleteBanner);

module.exports = router;
