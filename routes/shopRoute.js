const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shopController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));

const shopUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-shop",
  multerInstance.fields(shopUploadFields),
  shopController.addShop
);
router.put(
  "/update-shop/:shopId",
  multerInstance.fields(shopUploadFields),
  shopController.updateShop
);
router.patch("/delete-shop/:shopId", shopController.deleteShop);
router.patch("/restore-shop/:shopId", shopController.restoreShop);
router.get("/get-shops", shopController.getShops);
router.get("/get-shop/:shopId", shopController.getShopById);
router.get("/get-shop-categories", shopController.getShopCategories);
router.get("/get-shop-feedbacks", shopController.getShopFeedbacks);
router.get("/get-shop-complaints", shopController.getShopComplaints);
router.get("/get-shop-complaint/:id", shopController.getShopComplaintById);
router.patch("/resolve-complaints/:id", shopController.resolveComplaints);
router.patch("/reject-complaints/:id", shopController.rejectComplaints);
router.get("/delete-complaints/:id", shopController.deleteComplaints);

module.exports = router;
