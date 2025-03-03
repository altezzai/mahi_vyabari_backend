const express = require("express");
const router = express.Router();

const categoryController = require("../controller/categoryController");

router.post("/add-type",categoryController.addType);
router.post("/delete-type/:id",categoryController.deleteType);
router.post("/restore-type/:id",categoryController.restoreType);
router.post("/get-types",categoryController.getTypes);
router.post("/get-type/:id",categoryController.getTypeById);

router.post("/add-category",categoryController.upload.single("categoryIcon"),categoryController.addCategory);
router.put("/update-category/:id",categoryController.upload.single("categoryIcon"),categoryController.updateCategory);
router.patch("/delete-category/:id",categoryController.upload.single("categoryIcon"),categoryController.deleteCategory);
router.patch("/restore-category/:id",categoryController.upload.single("categoryIcon"),categoryController.restoreCategory);
router.get("/get-categories",categoryController.upload.single("categoryIcon"),categoryController.getCategory);
router.get("/get-category/:id",categoryController.upload.single("categoryIcon"),categoryController.getCategoryById);

module.exports = router;
