const express = require("express");
const router = express.Router();
const areaController = require("../controllers/areaController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, authorizeRoles("admin"));

router.get("/", areaController.getAreas);
router.get("/all", areaController.getAllAreas);
router.get("/:id", areaController.getAreaById);
router.post("/create", areaController.createArea);
router.put("/update/:id", areaController.updateArea);
router.patch("/delete/:id", areaController.deleteArea);
router.patch("/restore/:id", areaController.restoreArea);

module.exports = router;
