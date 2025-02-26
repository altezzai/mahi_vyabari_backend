const express = require("express");
const router = express.Router();

const medDirectoryController = require("../controller/medDirectoryController");

router.post("/add-medicalDirectory",medDirectoryController.upload.fields([{ name: "image" }, { name: "icon" }]),medDirectoryController.addMedicalDirectory);

module.exports = router;
