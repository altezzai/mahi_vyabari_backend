const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shopController");

router.get("/get-shops",shopController.getShop);
// router.get("/get-shop-search",shopController.getShopSearch);
router.get("/get-shop/:shopId",shopController.getShopById);
router.get("/get-shop-categories",shopController.getShopCategories);
router.post("/add-shop",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.addshop);
router.put("/update-shop/:shopId",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.updateShopById);
router.patch("/delete-shop/:shopId",shopController.deleteShop);
router.patch("/restore-shop/:shopId",shopController.restoreShop);

router.get("/get-shop-feedbacks",shopController.getShopFeedbacks);

router.get("/get-shop-complaints",shopController.getShopComplaints)

module.exports = router;
