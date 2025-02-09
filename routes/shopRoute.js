const express = require("express");
const router = express.Router();

const shopController = require("../controller/shopController");

router.post("/add-shop",shopController.upload.fields([{name:"shopImage"},{name:"shopIconImage"}]),shopController.addshop);
router.post("/add-product",shopController.addproduct);




module.exports = router;