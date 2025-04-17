const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

router.get("/get-customers", customerController.getCustomers);
router.get('/get-customer/:id',customerController.getCustomerById);
router.post('/add-customer',customerController.addCustomer)

module.exports = router;
