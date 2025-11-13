const express = require("express");
const router = express.Router();

const tourismController = require("../controllers/tourismController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));
const tourismUploadFields = [{ name: "images", maxCount: 5 }];

router.post(
  "/add-tourist-place",
  multerInstance.fields(tourismUploadFields),
  tourismController.addTouristPlace
);
router.put(
  "/update-tourist-place/:id",
  multerInstance.none(),
  tourismController.updateTouristPlace
);
// --- Add ONE image to an existing spot ---
// POST /tourism/image/add/:id
router.post(
  "/image/add/:id",
  multerInstance.single("image"), // Use .single() for one file
  tourismController.addTourismImage
);

// --- Delete ONE image from a spot ---
// POST /tourism/image/delete/:id
router.post("/image/delete/:id", tourismController.deleteTourismImage);
router.patch("/delete-tourist-place/:id", tourismController.deleteTouristPlace);
router.patch(
  "/restore-tourist-place/:id",
  tourismController.restoreTouristPlace
);
router.get("/get-tourist-places", tourismController.getTouristPlaces);
router.get("/get-tourist-place/:id", tourismController.getTouristPlaceById);
module.exports = router;
