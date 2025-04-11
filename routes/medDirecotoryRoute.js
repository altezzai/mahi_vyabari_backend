const express = require("express");
const router = express.Router();

const medDirectoryController = require("../controllers/medDirectoryController");

router.post("/add-medicalDirectory",medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),medDirectoryController.addMedicalDirectory);
router.put("/update-medicalDirectory/:id",medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),medDirectoryController.updateMedicalDirectory);
router.patch("/delete-medicalDirectory/:id",medDirectoryController.deleteMedicalDirectory);
router.patch("/restore-medicalDirectory/:id",medDirectoryController.restoreMedicalDirectory);
router.get("/get-medicalDirectory",medDirectoryController.getMedicalDirectory);
router.get("/get-medicalDirectory/:id",medDirectoryController.getMedicalDirectoryById);
router.get("/get-medical-category",medDirectoryController.getMedicalCategory)

module.exports = router;
