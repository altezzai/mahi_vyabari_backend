const express = require("express");
const router = express.Router();

const shopController = require("../controller/shopController");

router.post("/add-shop",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.addshop);
router.get("/get-shops",shopController.getShops);
router.get("/get-shop/:shopId",shopController.getShopById);
router.put("/update-shop/:shopId",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.updateShopById);
router.get("/delete-shop/:shopId",shopController.deleteShop);
router.get("/restore-shop/:shopId",shopController.restoreShop);

module.exports = router;
