const express = require("express");
const router = express.Router();

const shopController = require("../controller/shopController");

router.post("/add-shop",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.addshop);
router.get("/get-shops",shopController.getShops);
router.get("/get-shop/:id",shopController.getShopById);
router.put("/update-shop/:id",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.updateShopById);
router.get("/delete-shop/:id",shopController.deleteShop);
router.get("/restore-shop/:id",shopController.restoreShop)


module.exports = router;
