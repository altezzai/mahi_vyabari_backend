const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const userAuth = require("../middleware/auth");

router.post("/register-user", userController.registerUser);
router.post("/login-user", userController.userLogin);
router.post("/logout", userController.Logout);
router.post("/send-register-otp",userController.sendVerifyOtp);
router.post("/verify-account", userAuth, userController.verifyAccount);
router.post("/is-auth", userAuth, userController.isAuthenticated);
router.post("/send-reset-otp", userController.sendResetOtp);
router.post("/reset-password", userController.resetPassword);
router.post("/send-login-otp", userController.sendLoginOtp);

router.put(
  "/edit-user/:id",
  userController.upload.single("image"),
  userController.editUser
);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/api/user/dashboard",
    failureRedirect: "/login",
  })
);
router.get("/dashboard", userController.getDashboard);
router.post("/add-feedback", userController.feedback);
router.post("/add-complaints", userController.complaints);
router.get("/get-complaints", userController.getAllComplaints);
router.get("/get-complaints/:userId", userController.getComplaintsById);
router.patch("/update-complaints/:id", userController.updateComplaints);
router.get("/delete-complaints/:id", userController.deleteComplaints);

module.exports = router;
