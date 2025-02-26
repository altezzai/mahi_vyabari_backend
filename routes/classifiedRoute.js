const express = require("express");
const router = express.Router();

const classifiedController = require("../controller/classifiedController");

router.post("/add-classified",classifiedController.upload.fields([{ name: "image" },{ name: "icon" }]),classifiedController.addClassfied);

module.exports = router;