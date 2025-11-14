const express = require("express");
const router = express.Router();

const classifiedController = require("../controllers/classifiedController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload } = require("../middleware/upload2");
// router.use(userAuth, authorizeRoles("admin"));
const classifiedUploadFields = [
  { name: "images", maxCount: 5 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-classified",
  upload.fields(classifiedUploadFields),
  classifiedController.addClassified
);
router.put(
  "/update-classified/:id",
  upload.fields(classifiedUploadFields),
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
