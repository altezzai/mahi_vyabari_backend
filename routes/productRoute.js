const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.post(
  "/add-product",
  productController.upload.single("image"),
  productController.addProduct
);
router.put(
  "/update-product/:id",
  productController.upload.single("image"),
  productController.updateProduct
);
router.get("/get-products", productController.getProducts);
router.get("/get-shop-names", productController.getShopName);
router.get("/get-product/:id", productController.getProductById);
router.patch("/delete-product/:id", productController.deleteProductById);
router.patch("/restore-product/:id", productController.restoreProductById);

module.exports = router;
