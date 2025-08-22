const express = require("express");
const router = express.Router();

const emergencyController = require("../controllers/emergencyController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, authorizeRoles("admin"));

router.post(
  "/add-emergency",
  emergencyController.upload.single("icon"),
  emergencyController.addEmergency
);
router.put(
  "/update-emergency/:id",
  emergencyController.upload.single("icon"),
  emergencyController.updateEmergency
);
router.patch("/delete-emergency/:id", emergencyController.deleteEmergency);
router.patch("/restore-emergency/:id", emergencyController.restoreEmergency);
router.get("/get-emergencies", emergencyController.getEmergencies);
router.get("/get-emergency/:id", emergencyController.getEmergencyById);

module.exports = router;
