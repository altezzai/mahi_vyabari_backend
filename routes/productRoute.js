const express = require("express");
const router = express.Router();

const productController = require("../controller/productController")

router.post("/add-product",productController.upload.single("image"),productController.addProduct);
router.put("/update-product/:id",productController.upload.single("image"),productController.editProduct);
router.get('/get-products',productController.getProducts);
router.get("/get-product-search",productController.getProductSearch)
router.get('/get-product/:id',productController.getProductById);
router.patch('/delete-product/:id',productController.deleteProductById);
router.patch('/restore-product/:id',productController.restoreProductById);

module.exports = router