const express = require("express");
const router = express.Router();

const coupenController = require("../controllers/couponController");

router.post("/request-coupon",coupenController.requestCoupen);
router.patch("/assign-shop-coupon-request/:id",coupenController.assignShopCouponRequest);
router.post("/assign-shop-coupon",coupenController.assignShopCoupon);
router.post("/assign-user-coupon",coupenController.assignUserCoupon)

module.exports = router;