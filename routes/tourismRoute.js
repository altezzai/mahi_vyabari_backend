const express = require("express");
const router = express.Router();

const tourismController = require("../controllers/tourismController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, authorizeRoles("admin"));

router.post(
  "/add-tourist-place",
  tourismController.upload.array("images", 4),
  tourismController.addTouristPlace
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
