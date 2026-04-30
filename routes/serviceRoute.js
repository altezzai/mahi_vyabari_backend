const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadWithErrorHandler } = require("../middleware/upload2");
// router.use(userAuth, authorizeRoles("admin"));
const serviceUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-service-profile",
  uploadWithErrorHandler(upload.fields(serviceUploadFields)),
  serviceController.addServiceProfile
);
router.put(
  "/update-service-profile/:id",
  uploadWithErrorHandler(upload.fields(serviceUploadFields)),
  serviceController.updateServiceProfile
);
router.patch(
  "/delete-service-profile/:id",
  serviceController.deleteServiceProfile
);
router.get(
  "/get-trashed-service-profiles",
  serviceController.getTrashedServiceProfiles
);
router.patch(
  "/restore-service-profile/:id",
  serviceController.restoreServiceProfile
);
router.get("/get-service-profiles", serviceController.getServiceProfiles);
router.get("/get-service-profile/:id", serviceController.getServiceProfileById);
router.get("/get-service-category", serviceController.getServiceCategory);

module.exports = router;