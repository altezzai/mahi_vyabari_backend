const express = require("express");
const router = express.Router();

const classifiedController = require("../controllers/classifiedController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, authorizeRoles("admin"));

router.post(
  "/add-classified",
  classifiedController.upload.fields([{ name: "image" }, { name: "icon" }]),
  classifiedController.addClassified
);
router.put(
  "/update-classified/:id",
  classifiedController.upload.fields([{ name: "image" }, { name: "icon" }]),
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
