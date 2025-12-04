const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  otpLimiter,
  authLimiter,
  apiLimiter,
} = require("../middleware/rateLimiter");
const multerInstance = require("../middleware/upload");
const { upload } = require("../middleware/upload2");
const { ro } = require("date-fns/locale");

const userUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/me", userAuth, userController.getCurrentUser);
router.post("/send-register-otp", otpLimiter, userController.sendVerifyOtp);
router.post("/register-user", authLimiter, userController.registerUser);
router.post("/login-user", authLimiter, userController.userLogin);
router.get("/refresh-token", userController.refreshAccessToken);

router.post("/forget-password", userController.forgetPassword);
router.post("/send-reset-otp", otpLimiter, userController.sendResetOtp);
router.post("/reset-password", userAuth, userController.resetPassword);
router.post(
  "/admin-change-password",
  userAuth,
  authorizeRoles("admin"),
  userController.adminChangePassword
);

router.post("/logout", userAuth, userController.Logout);
router.put(
  "/edit-user",
  userAuth,
  authorizeRoles("user", "shop"),
  upload.single("image"),
  userController.editUser
);
router.get(
  "/personal-details",
  userAuth,
  authorizeRoles("user", "shop"),
  userController.getPersonalDetails
);
router.post(
  "/add-feedback",
  userAuth,
  authorizeRoles("user"),
  apiLimiter,
  userController.feedback
);
router.post(
  "/add-complaints",
  userAuth,
  authorizeRoles("user"),
  apiLimiter,
  userController.complaints
);
router.get(
  "/get-complaint/:id",
  userAuth,
  authorizeRoles("admin"),
  userController.getComplaintsById
);
router.get(
  "/get-shop-complaints-for-user",
  userAuth,
  authorizeRoles("user"),
  userController.getShopComplaintSForUser
);
router.delete(
  "/delete-complaints/:id",
  userAuth,
  authorizeRoles("user"),
  userController.deleteComplaint
);
router.get(
  "/get-own-feedbacks",
  userAuth,
  authorizeRoles("user"),
  userController.getOwnFeedbacks
);
router.put(
  "/edit-feedback/:id",
  userAuth,
  authorizeRoles("user"),
  userController.editFeedback
);
router.get(
  "/get-registration-status",
  userAuth,
  authorizeRoles("admin"),
  userController.getRegistrationStatus
);
router.get(
  "/get-category-distribution",
  userAuth,
  authorizeRoles("admin"),
  userController.getCategoryDistribution
);
router.get(
  "/get-user-monthly-registration",
  userAuth,
  authorizeRoles("admin"),
  userController.getUserMonthlyRegistration
);
router.get(
  "/get-recent-activities",
  userAuth,
  authorizeRoles("admin"),
  userController.getRecentActivities
);
router.get(
  "/get-top-shop-user-coupon",
  userAuth,
  authorizeRoles("admin"),
  userController.getTopShopUserCoupon
);

module.exports = router;
