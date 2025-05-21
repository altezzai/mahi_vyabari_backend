const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const userAuth = require("../middleware/authMiddleware");
const autherizeRoles = require("../middleware/roleMiddleware");

router.get("/me", userAuth, userController.getCurrentUser);
router.post("/send-register-otp", userController.sendVerifyOtp);
router.post("/register-user", userController.registerUser);
router.post("/login-user", userController.userLogin);
router.post("/send-reset-otp", userController.sendResetOtp);
router.post("/reset-password", userController.resetPassword);
router.post("/logout", userController.Logout);

// router.post("/verify-account", userAuth, userController.verifyAccount);
// router.post("/is-auth", userAuth, userController.isAuthenticated);
// router.post("/send-login-otp", userController.sendLoginOtp);
router.put(
  "/edit-user/:id",
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
router.post(
  "/add-feedback",
  userAuth,
  autherizeRoles("user"),
  userController.feedback
);
router.post(
  "/add-complaints",
  userAuth,
  autherizeRoles("user"),
  userController.complaints
);
router.get(
  "/get-complaints",
  userAuth,
  autherizeRoles("user"),
  userController.getComplaints
);
// router.get(
//   "/get-complaints/:id",
//   userAuth,
//   autherizeRoles("admin"),
//   userController.getComplaintsById
// );
// router.patch(
//   "/update-complaints/:id",
//   userAuth,
//   autherizeRoles("admin"),
//   userController.updateComplaints
// );
// router.get(
//   "/delete-complaints/:id",
//   userAuth,
//   autherizeRoles("admin"),
//   userController.deleteComplaints
// );

module.exports = router;
