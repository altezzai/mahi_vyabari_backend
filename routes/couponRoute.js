const express = require("express");
const router = express.Router();
const coupenController = require("../controllers/couponController");

router.post("/request-coupon", coupenController.requestCoupen);
router.put(
  "/assign-shop-coupon-request/:id",
  coupenController.assignShopCouponRequest
);
router.post("/assign-shop-coupon", coupenController.assignShopCoupon);
router.post("/assign-user-coupon", coupenController.assignUserCoupon);
router.get("/get-shops",coupenController.getShops);
router.get("/get-users",coupenController.getUsers);
router.get("/get-recent-user-coupons",coupenController.getRecentUserCoupons);
router.get("/get-shop-current-coupon-status",coupenController.getCurrentShopCouponStatus);
router.get("/get-user-coupon-status",coupenController.getUserCouponStatus)
router.get("/get-pending-coupons",coupenController.getPendingCoupons);
router.get("/get-coupon-requests", coupenController.getCouponRequests);
router.get("/get-assigned-coupons", coupenController.getAssignedCoupon);
router.get("/get-coupon-history", coupenController.getCouponHistory);

module.exports = router;
