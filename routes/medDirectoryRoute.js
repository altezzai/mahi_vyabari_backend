const express = require("express");
const router = express.Router();

const medDirectoryController = require("../controllers/medDirectoryController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));
const medicalUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-medicalDirectory",
  multerInstance.fields(medicalUploadFields),
  medDirectoryController.addMedicalDirectory
);
router.put(
  "/update-medicalDirectory/:id",
  multerInstance.fields(medicalUploadFields),
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
