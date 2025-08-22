const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const userAuth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {couponRequestLimiter} = require("../middleware/rateLimiter");

router.post(
  "/request-coupon",
  userAuth,
  authorizeRoles("shop"),
  couponRequestLimiter,
  couponController.requestCoupon
);
router.put(
  "/assign-shop-coupon-request/:id",
  userAuth,
  authorizeRoles("admin"),
  couponController.assignShopCouponRequest
);
router.post(
  "/assign-shop-coupon",
  userAuth,
  authorizeRoles("admin"),
  couponController.assignShopCoupon
);
router.post(
  "/assign-user-coupon",
  userAuth,
  authorizeRoles("shop"),
  couponController.assignUserCoupon
);
router.get(
  "/get-shops",
  userAuth,
  authorizeRoles("admin"),
  couponController.getShops
);
router.get(
  "/get-users",
  userAuth,
  authorizeRoles("shop"),
  couponController.getUsers
);
router.get(
  "/get-recent-user-coupons",
  userAuth,
  authorizeRoles("shop"),
  couponController.getRecentUserCoupons
);
router.get(
  "/get-shop-current-coupon-status",
  userAuth,
  authorizeRoles("shop"),
  couponController.getCurrentShopCouponStatus
);
router.get(
  "/get-user-coupon-status",
  userAuth,
  authorizeRoles("user"),
  couponController.getUserCouponStatus
);
router.get(
  "/get-pending-coupons",
  userAuth,
  authorizeRoles("shop"),
  couponController.getPendingCoupons
);
router.get(
  "/get-coupon-requests",
  userAuth,
  authorizeRoles("admin"),
  couponController.getCouponRequests
);
router.get(
  "/get-assigned-coupons",
  userAuth,
  authorizeRoles("admin"),
  couponController.getAssignedCoupon
);
router.get(
  "/get-coupon-history",
  userAuth,
  authorizeRoles("admin"),
  couponController.getCouponHistory
);

module.exports = router;
