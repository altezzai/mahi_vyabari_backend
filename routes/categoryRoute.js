const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadWithErrorHandler } = require("../middleware/upload2");

// router.use(userAuth, authorizeRoles("admin"));

const categoryUploadFields = [{ name: "icon", maxCount: 1 }];

router.post(
  "/add-type",
  uploadWithErrorHandler(upload.single("icon")),
  categoryController.addType
);
router.put(
  "/update-type/:id",
  uploadWithErrorHandler(upload.single("icon")),
  categoryController.updateType
);
router.patch("/delete-type/:id", categoryController.deleteType);
router.patch("/restore-type/:id", categoryController.restoreType);
router.get("/get-types", categoryController.getTypes);
router.get("/get-type/:id", categoryController.getTypeById);

router.post(
  "/add-category",
  uploadWithErrorHandler(upload.single("icon")),
  categoryController.addCategory
);
router.put(
  "/update-category/:id",
  uploadWithErrorHandler(upload.single("icon")),
  categoryController.updateCategory
);
router.patch("/delete-category/:id", categoryController.deleteCategory);
router.patch("/restore-category/:id", categoryController.restoreCategory);
router.get("/get-categories", categoryController.getCategories);
router.get("/get-category/:id", categoryController.getCategoryById);

module.exports = router;
