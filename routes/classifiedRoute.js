const express = require("express");
const router = express.Router();

const classifiedController = require("../controllers/classifiedController");

router.post(
  "/add-classified",
  classifiedController.upload.fields([{ name: "image" }, { name: "icon" }]),
  classifiedController.addClassfied
);
router.put(
  "/update-classified/:id",
  classifiedController.upload.fields([{ name: "image" }, { name: "icon" }]),
  classifiedController.updateClassfied
);
router.patch("/delete-classified/:id", classifiedController.deleteClassfied);
router.patch("/restore-classified/:id", classifiedController.restoreClassfied);
router.get("/get-classifieds", classifiedController.getClassfieds);
router.get("/get-classified/:id", classifiedController.getClassfiedById);
router.get(
  "/get-classified-categories",
  classifiedController.getClassfiedCategories
);

module.exports = router;
