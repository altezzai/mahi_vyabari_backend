const express = require("express");
const router = express.Router();

const workerController = require("../controller/workerController");

router.post("/add-worker-profile",workerController.upload.fields([{ name: "image" }, { name: "icon" }]),workerController.addWorkerProfile);

module.exports = router;
