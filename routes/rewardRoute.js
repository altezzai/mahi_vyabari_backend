const express = require("express");
const router = express.Router();

const rewardController = require("../controllers/rewardController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const multerInstance = require("../middleware/upload");
// router.use(userAuth, authorizeRoles("admin"));
const { upload } = require("../middleware/upload2");

const giftImageUpload = [{ name: "image", maxCount: 1 }];

router.post(
  "/create-milestone",
  upload.single("image"),
  rewardController.createMilestone
);
router.put(
  "/update-milestone/:id",
  upload.single("image"),
  rewardController.updateMilestone
);
router.get("/get-milestones", rewardController.getAllMilestones);
router.get("/get-milestone/:id", rewardController.getMilestoneById);
router.delete("/delete-milestone/:id", rewardController.deleteMilestone);

//reward
router.post("/create-reward", rewardController.createReward);
router.put("/update-reward/:id", rewardController.updateReward);
router.get("/get-rewards", rewardController.getAllRewards);
router.get("/get-reward/:id", rewardController.getRewardById);
router.delete("/delete-reward/:id", rewardController.deleteReward);

module.exports = router;
