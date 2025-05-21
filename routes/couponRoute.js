const express = require("express");
const router = express.Router();
const coupenController = require("../controllers/couponController");
const userAuth = require("../middleware/authMiddleware");
const autherizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/request-coupon",
  userAuth,
  autherizeRoles("shop"),
  coupenController.requestCoupen
);
router.put(
  "/assign-shop-coupon-request/:id",
  userAuth,
  autherizeRoles("admin"),
  coupenController.assignShopCouponRequest
);
router.post(
  "/assign-shop-coupon",
  userAuth,
  autherizeRoles("admin"),
  coupenController.assignShopCoupon
);
router.post(
  "/assign-user-coupon",
  userAuth,
  autherizeRoles("shop"),
  coupenController.assignUserCoupon
);
router.get(
  "/get-shops",
  userAuth,
  autherizeRoles("admin"),
  coupenController.getShops
);
router.get(
  "/get-users",
  userAuth,
  autherizeRoles("shop"),
  coupenController.getUsers
);
router.get(
  "/get-recent-user-coupons",
  userAuth,
  autherizeRoles("shop"),
  coupenController.getRecentUserCoupons
);
router.get(
  "/get-shop-current-coupon-status",
  userAuth,
  autherizeRoles("shop"),
  coupenController.getCurrentShopCouponStatus
);
router.get(
  "/get-user-coupon-status",
  userAuth,
  autherizeRoles("user"),
  coupenController.getUserCouponStatus
);
router.get(
  "/get-pending-coupons",
  userAuth,
  autherizeRoles("shop"),
  coupenController.getPendingCoupons
);
router.get(
  "/get-coupon-requests",
  userAuth,
  autherizeRoles("admin"),
  coupenController.getCouponRequests
);
router.get(
  "/get-assigned-coupons",
  userAuth,
  autherizeRoles("admin"),
  coupenController.getAssignedCoupon
);
router.get(
  "/get-coupon-history",
  userAuth,
  autherizeRoles("admin"),
  coupenController.getCouponHistory
);

module.exports = router;
