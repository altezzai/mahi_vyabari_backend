const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controller/userController");

router.post("/create-user",userController.upload.single("image"),userController.createUser);
router.put("/edit-user/:id",userController.upload.single("image"),userController.editUser);
router.post("/user-login", userController.userLogin);
router.get("/auth/google",passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback",passport.authenticate("google", { successRedirect: "/api/user/dashboard", failureRedirect: "/login" }));
router.get("/logout",userController.Logout)
router.get("/dashboard",async (req,res)=>{res.json({message:"successfully logined..!" + req.user})})

module.exports = router;
