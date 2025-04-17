const ShopCoupen = require("../models/shopCoupon");

module.exports = {
  requestCoupen: async (req, res) => {
    const couponData = {
      ...req.body,
      status: "pending",
    };
    try {
      const shopcoupon = await ShopCoupen.create(couponData);
      res.status(200).json({
        success: true,
        shopcoupon,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
  assignShopCouponRequest: async (req, res) => {
    const { assignedCount, couponIdFrom, couponIdTo } = req.body;
    try {
      const { id } = req.params;
      const shopCoupon = await ShopCoupen.findByPk(id);
      if (!shopCoupon) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon Request Is Not Found" });
      }
      await shopCoupon.update({
        assignedCount,
        couponIdFrom,
        couponIdTo,
        status: "assigned",
      });
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  assignShopCoupon: async (req, res) => {
    try {
      const couponData = {
        ...req.body,
        status: "assigned",
      };
      const shopCoupon = await ShopCoupen.create(couponData);
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  assignUserCoupon:async(req,res)=>{
    try {
      
    } catch (error) {
      
    }
  }
};
