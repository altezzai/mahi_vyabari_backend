const express = require("express");
const router = express.Router();

const categoryController = require("../controller/categoryController");

router.post("/add-type",categoryController.addType);
router.post("/delete-type/:id",categoryController.deleteType);
router.post("/restore-type/:id",categoryController.restoreType);
router.post("/get-types",categoryController.getTypes);
router.post("/get-type/:id",categoryController.getTypeById);

router.post("/add-category",categoryController.upload.single("icon"),categoryController.addCategory);
router.put("/update-category/:id",categoryController.upload.single("icon"),categoryController.updateCategory);
router.patch("/delete-category/:id",categoryController.deleteCategory);
router.patch("/restore-category/:id",categoryController.restoreCategory);
router.get("/get-categories",categoryController.getCategory);
router.get("/get-category/:id",categoryController.getCategoryById);

module.exports = router;
