const express = require("express");
const router = express.Router();

const shopController = require("../controller/shopController");

router.post("/add-shop",shopController.upload.fields([{ name: "image" },{ name: "icon" }]),shopController.addshop);
router.post("/add-product",shopController.upload.single("image"),shopController.addproduct);

module.exports = router;
