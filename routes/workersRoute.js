const express = require("express");
const router = express.Router();

const workerController = require("../controllers/workerController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload } = require("../middleware/upload2");
// router.use(userAuth, authorizeRoles("admin"));
const workerUploadFields = [
  { name: "image", maxCount: 1 },
  { name: "icon", maxCount: 1 },
];

router.post(
  "/add-worker-profile",
  upload.fields(workerUploadFields),
  workerController.addWorkerProfile
);
router.put(
  "/update-worker-profile/:id",
  upload.fields(workerUploadFields),
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
