const express = require("express");
const router = express.Router();

const medDirectoryController = require("../controller/medDirectoryController");

router.post("/add-medicalDirectory",medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),medDirectoryController.addMedicalDirectory);
router.put("/update-medicalDirectory/:id",medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),medDirectoryController.updateMedicalDirectory);
router.patch("/delete-medicalDirectory/:id",medDirectoryController.deleteMedicalDirectory);
router.patch("/restore-medicalDirectory/:id",medDirectoryController.restoreMedicalDirectory);
router.get("/get-medicalDirectory",medDirectoryController.getMedicalDirectory);
router.get("/get-medicalDirectory-search",medDirectoryController.getMedicalDirectorySearch);
router.get("/get-medicalDirectory/:id",medDirectoryController.getMedicalDirectoryById);

module.exports = router;
