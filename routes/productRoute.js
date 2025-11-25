const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadWithErrorHandler } = require("../middleware/upload2");
// router.use(userAuth, authorizeRoles("admin"));
const productUploadFields = [{ name: "image", maxCount: 1 }];

router.post(
  "/add-product",
  uploadWithErrorHandler(upload.single("image")), // multerInstance.fields(productUploadFields),
  productController.addProduct
);
router.put(
  "/update-product/:id",
  uploadWithErrorHandler(upload.single("image")),
  productController.updateProduct
);
router.get("/get-products", productController.getProducts);
router.get("/get-shop-names", productController.getShopName);
router.get("/get-product/:id", productController.getProductById);
router.patch("/delete-product/:id", productController.deleteProductById);
router.patch("/restore-product/:id", productController.restoreProductById);

module.exports = router;
