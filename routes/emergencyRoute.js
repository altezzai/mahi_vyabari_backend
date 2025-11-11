const express = require("express");
const router = express.Router();

const emergencyController = require("../controllers/emergencyController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));
const emergencyUploadFields = [{ name: "icon", maxCount: 1 }];

router.post(
  "/add-emergency",
  multerInstance.fields(emergencyUploadFields),
  emergencyController.addEmergency
);
router.put(
  "/update-emergency/:id",
  multerInstance.fields(emergencyUploadFields),
  emergencyController.updateEmergency
);
router.patch("/delete-emergency/:id", emergencyController.deleteEmergency);
router.patch("/restore-emergency/:id", emergencyController.restoreEmergency);
router.get("/get-emergencies", emergencyController.getEmergencies);
router.get("/get-emergency/:id", emergencyController.getEmergencyById);

module.exports = router;
