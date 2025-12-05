const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadWithErrorHandler } = require("../middleware/upload2");
router.use(userAuth, authorizeRoles("admin"));
const vehicleUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post("/add-vehicleSchedule", vehicleController.addVehicleSchedule);
router.put(
  "/update-vehicleSchedule/:id",
  vehicleController.updateVehicleSchedule
);
router.patch(
  "/delete-vehicleSchedule/:id",
  vehicleController.deleteVehicleSchedule
);
router.patch(
  "/restore-vehicleSchedule/:id",
  vehicleController.restoreVehicleSchedule
);
router.delete(
  "/permanent-delete-vehicleSchedule/:id",
  vehicleController.permanentDeleteVehicleSchedule
);
router.get("/get-vehicleSchedules", vehicleController.getVehicleSchedules);
router.get(
  "/get-vehicleSchedule/:id",
  vehicleController.getVehicleScheduleById
);

router.post(
  "/add-vehicle-Service",
  uploadWithErrorHandler(upload.fields(vehicleUploadFields)),
  vehicleController.addVehicleServiceProvider
);
router.put(
  "/update-vehicle-Service/:id",
  uploadWithErrorHandler(upload.fields(vehicleUploadFields)),
  vehicleController.updateVehicleServiceProvider
);
router.patch(
  "/delete-vehicle-Service/:id",
  vehicleController.deleteVehicleServiceProvider
);
router.patch(
  "/restore-vehicle-Service/:id",
  vehicleController.restoreVehicleServiceProvider
);
router.get(
  "/get-vehicle-Services",
  vehicleController.getVehicleServiceProviders
);
router.get(
  "/get-vehicle-Service/:id",
  vehicleController.getVehicleServiceProviderById
);
router.get(
  "/get-vehicle-service-categories",
  vehicleController.getVehicleServiceCategories
);
//manage places
router.post("/add-place", vehicleController.addPlace);
router.put("/update-place/:id", vehicleController.updatePlace);
router.patch("/delete-place/:id", vehicleController.deletePlace);
router.patch("/restore-place/:id", vehicleController.restorePlace);
router.get("/get-places", vehicleController.getPlaces);
router.get("/get-place/:id", vehicleController.getPlaceById);

module.exports = router;
