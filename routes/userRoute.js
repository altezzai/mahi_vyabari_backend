const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");

router.post("/create-user",userController.upload.single("image"),userController.createUser);
router.put("/edit-user/:id",userController.upload.single("image"),userController.editUser);
router.post("/user-login", userController.userLogin);
router.get("/auth/google",passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback",passport.authenticate("google", { successRedirect: "/api/user/dashboard", failureRedirect: "/login" }));
router.get("/dashboard",userController.geDashboard);
router.post("/feedback",userController.feedback);
router.post("/create-complaints",userController.complaints);
router.get("/get-complaints",userController.getAllComplaints);
router.get("/get-complaints/:userId",userController.getComplaintsById);
router.patch("/update-complaints/:id",userController.updateComplaints);
router.get("/delete-complaints/:id",userController.deleteComplaints)
router.get("/logout",userController.Logout);


module.exports = router;
