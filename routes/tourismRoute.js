const express = require("express");
const router = express.Router();

const tourismController = require("../controllers/tourismController");

router.post(
  "/add-tourist-place",
  tourismController.upload.array("images", 4),
  tourismController.addTrouristPlace
);
router.put(
  "/update-tourist-place/:id",
  tourismController.upload.array("images", 4),
  tourismController.updateTouristPlace
);
router.patch("/delete-tourist-place/:id", tourismController.deleteTouristPlace);
router.patch(
  "/restore-tourist-place/:id",
  tourismController.restoreTouristPlace
);
router.get("/get-tourist-places", tourismController.getTouristPlaces);
router.get("/get-tourist-place/:id", tourismController.getTouristPlaceById);
module.exports = router;
