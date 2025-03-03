const express = require("express");
const router = express.Router();

const workerController = require("../controller/workerController");

router.post("/add-worker-profile",workerController.upload.fields([{ name: "image" }, { name: "icon" }]),workerController.addWorkerProfile);
router.post("/update-worker-profile",workerController.upload.fields([{ name: "image" }, { name: "icon" }]),workerController.updateWorkerProfile);
router.post("/delete-worker-profile",workerController.deleteWorkerProfile);
router.post("/restore-worker-profile",workerController.restoreWorkerProfile);
router.post("/get-worker-profiles",workerController.getWorkerProfiles);
router.post("/get-worker-profile/:id",workerController.getWorkerProfileById);

module.exports = router;
