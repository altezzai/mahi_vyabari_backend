const express = require("express");
const router = express.Router();

const productController = require("../controller/productController")

router.post("/add-product",productController.upload.single("image"),productController.addproduct);

module.exports = router