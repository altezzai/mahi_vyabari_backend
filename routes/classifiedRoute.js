const express = require("express");
const router = express.Router();

const classifiedController = require("../controllers/classifiedController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadWithErrorHandler } = require("../middleware/upload2");
// router.use(userAuth, authorizeRoles("admin"));
const classifiedUploadFields = [
  { name: "images", maxCount: 5 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-classified",
  uploadWithErrorHandler(upload.fields(classifiedUploadFields)),
  classifiedController.addClassified
);
router.put(
  "/update-classified/:id",
  uploadWithErrorHandler(upload.fields(classifiedUploadFields)),
  classifiedController.updateClassified
);
router.patch("/delete-classified/:id", classifiedController.deleteClassified);
router.patch("/restore-classified/:id", classifiedController.restoreClassified);
router.get("/get-classifieds", classifiedController.getClassifieds);
router.get("/get-classified/:id", classifiedController.getClassifiedById);
router.get(
  "/get-classified-categories",
  classifiedController.getClassifiedCategories
);
router.delete(
  "/delete-classified-image/:id",
  classifiedController.deleteClassifiedImage
);

module.exports = router;
