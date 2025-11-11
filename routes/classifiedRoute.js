const express = require("express");
const router = express.Router();

const classifiedController = require("../controllers/classifiedController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));
const classifiedUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-classified",
  multerInstance.fields(classifiedUploadFields),
  classifiedController.addClassified
);
router.put(
  "/update-classified/:id",
  multerInstance.fields(classifiedUploadFields),
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

module.exports = router;
