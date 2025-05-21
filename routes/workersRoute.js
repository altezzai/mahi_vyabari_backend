const express = require("express");
const router = express.Router();

const workerController = require("../controllers/workerController");
const userAuth = require("../middleware/authMiddleware");
const autherizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, autherizeRoles("admin"));

router.post(
  "/add-worker-profile",
  workerController.upload.fields([{ name: "image" }, { name: "icon" }]),
  workerController.addWorkerProfile
);
router.put(
  "/update-worker-profile/:id",
  workerController.upload.fields([{ name: "image" }, { name: "icon" }]),
  workerController.updateWorkerProfile
);
router.patch(
  "/delete-worker-profile/:id",
  workerController.deleteWorkerProfile
);
router.patch(
  "/restore-worker-profile/:id",
  workerController.restoreWorkerProfile
);
router.get("/get-worker-profiles", workerController.getWorkerProfiles);
router.get("/get-worker-profile/:id", workerController.getWorkerProfileById);
router.get("/get-worker-category", workerController.getWorkerCategory);

module.exports = router;
