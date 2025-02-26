const express = require("express");
const router = express.Router();

const categoryController = require("../controller/categoryController");

router.post("/add-category",categoryController.upload.single("categoryIcon"),categoryController.addCategory);

module.exports = router;
