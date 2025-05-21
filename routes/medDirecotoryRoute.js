const express = require("express");
const router = express.Router();

const medDirectoryController = require("../controllers/medDirectoryController");
const userAuth = require("../middleware/authMiddleware");
const autherizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, autherizeRoles("admin"));

router.post(
  "/add-medicalDirectory",
  medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),
  medDirectoryController.addMedicalDirectory
);
router.put(
  "/update-medicalDirectory/:id",
  medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),
  medDirectoryController.updateMedicalDirectory
);
router.patch(
  "/delete-medicalDirectory/:id",
  medDirectoryController.deleteMedicalDirectory
);
router.patch(
  "/restore-medicalDirectory/:id",
  medDirectoryController.restoreMedicalDirectory
);
router.get(
  "/get-medicalDirectories",
  medDirectoryController.getMedicalDirectories
);
router.get(
  "/get-medicalDirectory/:id",
  medDirectoryController.getMedicalDirectoryById
);
router.get("/get-medical-category", medDirectoryController.getMedicalCategory);

module.exports = router;
