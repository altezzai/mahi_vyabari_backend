const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const userAuth = require("../middleware/authMiddleware");
const autherizeRoles = require("../middleware/roleMiddleware");
const {
  otpLimiter,
  authLimiter,
  apiLimiter,
} = require("../middleware/rateLimiter");

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
  autherizeRoles("user", "shop"),
  userController.upload.single("image"),
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
  autherizeRoles("user", "shop"),
  userController.getPersonalDetails
);
router.post(
  "/add-feedback",
  userAuth,
  autherizeRoles("user"),
  apiLimiter,
  userController.feedback
);
router.post(
  "/add-complaints",
  userAuth,
  autherizeRoles("user"),
  apiLimiter,
  userController.complaints
);
router.get(
  "/get-complaints",
  userAuth,
  autherizeRoles("user"),
  userController.getComplaints
);
router.get(
  "/get-registration-status",
  userAuth,
  autherizeRoles("admin"),
  userController.getRegistrationStatus
);
router.get(
  "/get-category-distribution",
  userAuth,
  autherizeRoles("admin"),
  userController.getCategoryDistribution
);
router.get(
  "/get-user-monthly-registration",
  userAuth,
  autherizeRoles("admin"),
  userController.getUserMonthlyRegistration
);
router.get(
  "/get-recent-activities",
  userAuth,
  autherizeRoles("admin"),
  userController.getRecentActivities
);
router.get(
  "/get-top-shop-user-coupon",
  userAuth,
  autherizeRoles("admin"),
  userController.getTopShopUserCoupon
);
// router.get(
//   "/get-complaints/:id",
//   userAuth,
//   autherizeRoles("admin"),
//   userController.getComplaintsById
// );

module.exports = router;
