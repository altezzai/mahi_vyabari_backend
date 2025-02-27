const express = require("express");
const router = express.Router();

const publicController = require("../controller/publicController");

router.get("/",publicController.homePage);

module.exports = router