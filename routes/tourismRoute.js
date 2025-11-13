const express = require("express");
const router = express.Router();

const tourismController = require("../controllers/tourismController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
const { upload } = require("../middleware/upload2");
// router.use(userAuth, authorizeRoles("admin"));
const tourismUploadFields = [{ name: "images", maxCount: 5 }];

router.post(
  "/add-tourist-place",
  upload.fields(tourismUploadFields),
  tourismController.addTouristPlace
);
router.put(
  "/update-tourist-place/:id",
  upload.fields(tourismUploadFields),
  tourismController.updateTouristPlace
);

router.delete(
  "/delete-tourism-image/:id",
  tourismController.deleteTourismImage
);
router.delete(
  "/delete-tourist-place/:id",
  tourismController.deleteTouristPlace
);
router.patch(
  "/restore-tourist-place/:id",
  tourismController.restoreTouristPlace
);
router.get("/get-tourist-places", tourismController.getTouristPlaces);
router.get("/get-tourist-place/:id", tourismController.getTouristPlaceById);
module.exports = router;
