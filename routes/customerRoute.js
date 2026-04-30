const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
router.use(userAuth, authorizeRoles("admin"));

router.get("/get-customers", customerController.getCustomers);
router.get("/get-customer/:id", customerController.getCustomerById);
router.post("/add-customer", customerController.addCustomer);
router.patch("/delete-customer/:id", customerController.deleteCustomer);
router.patch("/restore-customer/:id", customerController.restoreCustomer);
router.get("/get-trashed-customers", customerController.getTrashedCustomers);

router.delete(
  "/permanent-delete-customer/:id",
  customerController.permanentDeleteCustomer
);
router.put("/update-customer/:id", customerController.updateCustomer);

module.exports = router;
