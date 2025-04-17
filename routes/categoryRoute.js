const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

router.post("/add-type", categoryController.addType);
router.patch("/delete-type/:id", categoryController.deleteType);
router.patch("/restore-type/:id", categoryController.restoreType);
router.get("/get-types", categoryController.getTypes);
router.get("/get-type/:id", categoryController.getTypeById);

router.post(
  "/add-category",
  categoryController.upload.single("icon"),
  categoryController.addCategory
);
router.put(
  "/update-category/:id",
  categoryController.upload.single("icon"),
  categoryController.updateCategory
);
router.patch("/delete-category/:id", categoryController.deleteCategory);
router.patch("/restore-category/:id", categoryController.restoreCategory);
router.get("/get-categories", categoryController.getCategories);
router.get("/get-category/:id", categoryController.getCategoryById);

module.exports = router;
