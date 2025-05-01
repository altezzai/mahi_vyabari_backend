const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

router.get("/get-customers", customerController.getCustomers);
router.get('/get-customer/:id',customerController.getCustomerById);
router.post('/add-customer',customerController.addCustomer);
router.patch('/delete-customer/id',customerController.deleteCustomer);
router.patch('/restore-customer/id',customerController.restoreCustomer);

module.exports = router;
