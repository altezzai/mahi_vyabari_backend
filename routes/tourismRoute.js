const express = require("express");
const router = express.Router();

const tourismController = require("../controllers/tourismController");

router.post(
  "/add-tourist-place",
  tourismController.upload.array("images",4),
  tourismController.addTrouristPlace
);

module.exports = router;