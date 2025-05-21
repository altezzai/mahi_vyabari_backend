const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shopController");
const userAuth = require("../middleware/authMiddleware");
const autherizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/add-shop",
  userAuth,
  autherizeRoles("admin"),
  shopController.upload.fields([{ name: "image" }, { name: "icon" }]),
  shopController.addshop
);
router.put(
  "/update-shop/:shopId",
  shopController.upload.fields([{ name: "image" }, { name: "icon" }]),
  shopController.updateShop
);
router.patch("/delete-shop/:shopId", shopController.deleteShop);
router.patch("/restore-shop/:shopId", shopController.restoreShop);
router.get("/get-shops", shopController.getShops);
router.get("/get-shop/:shopId", shopController.getShopById);
router.get("/get-shop-categories", shopController.getShopCategories);
router.get("/get-shop-feedbacks", shopController.getShopFeedbacks);
router.get("/get-shop-complaints", shopController.getShopComplaints);


module.exports = router;
