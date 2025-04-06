const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shopController");

router.post("/add-shop",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.addshop);
router.get("/get-shops",shopController.getShopSearch);
// router.get("/get-shop-search",shopController.getShopSearch);
router.get("/get-shop/:shopId",shopController.getShopById);
router.put("/update-shop/:shopId",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.updateShopById);
router.patch("/delete-shop/:shopId",shopController.deleteShop);
router.patch("/restore-shop/:shopId",shopController.restoreShop);

module.exports = router;
