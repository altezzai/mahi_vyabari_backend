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

const userUploadFields = [{ name: "image", maxCount: 1 }];

router.get("/me", userAuth, userController.getCurrentUser);
router.post("/send-register-otp", otpLimiter, userController.sendVerifyOtp);
router.post("/register-user", authLimiter, userController.registerUser);
router.post("/login-user", authLimiter, userController.userLogin);
router.post(
  "/send-reset-otp",
  otpLimiter,
  userAuth,
  userController.sendResetOtp
);
router.post("/reset-password", userAuth, userController.resetPassword);
router.post("/logout", userAuth, userController.Logout);
// router.post("/verify-account", userAuth, userController.verifyAccount);
// router.post("/is-auth", userAuth, userController.isAuthenticated);
// router.post("/send-login-otp", userController.sendLoginOtp);
router.put(
  "/edit-user",
  userAuth,
  authorizeRoles("user", "shop"),
  upload.single("image"),
  userController.editUser
);
// router.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: "/api/user/dashboard",
//     failureRedirect: "/login",
//   })
// );
// router.get("/dashboard", userController.getDashboard);
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
  "/get-complaints",
  userAuth,
  authorizeRoles("user"),
  userController.getComplaints
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
// router.get(
//   "/get-complaints/:id",
//   userAuth,
//   autherizeRoles("admin"),
//   userController.getComplaintsById
// );

module.exports = router;
