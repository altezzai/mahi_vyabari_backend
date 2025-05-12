const Shop = require("../models/Shop");
const ShopCoupon = require("../models/shopCoupon");
const UserCoupon = require("../models/userCoupon");
const sequelize = require("../config/database");
const { Op, Sequelize } = require("sequelize");
const User = require("../models/User");
const Tourism = require("../models/Tourism");

module.exports = {
  requestCoupen: async (req, res) => {
    const couponData = {
      ...req.body,
      status: "pending",
    };
    try {
      const shopcoupon = await ShopCoupon.create(couponData);
      res.status(200).json({
        success: true,
        shopcoupon,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  assignShopCouponRequest: async (req, res) => {
    const { assignedCount } = req.body;
    try {
      const { id } = req.params;
      const shopCoupon = await ShopCoupon.findByPk(id);
      if (!shopCoupon) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon Request Is Not Found" });
      }
      const lastAssigned = await ShopCoupon.findOne({
        order: [["couponIdTo", "DESC"]],
        attributes: ["couponIdTo"],
      });
      let nextCouponIdFrom = 1;
      if (lastAssigned && lastAssigned.couponIdTo) {
        nextCouponIdFrom = lastAssigned.couponIdTo + 1;
      }
      await shopCoupon.update({
        assignedCount,
        couponIdFrom: nextCouponIdFrom,
        couponIdTo: nextCouponIdFrom + assignedCount - 1,
        status: "assigned",
      });
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  assignShopCoupon: async (req, res) => {
    const { assignedCount, shopId } = req.body;
    try {
      const lastAssigned = await ShopCoupon.findOne({
        order: [["couponIdTo", "DESC"]],
        attributes: ["couponIdTo"],
      });
      if (lastAssigned && lastAssigned.couponIdTo) {
        nextCouponIdFrom = lastAssigned.couponIdTo + 1;
      }
      const shopCoupon = await ShopCoupon.create({
        shopId,
        assignedCount,
        couponIdFrom: nextCouponIdFrom,
        couponIdTo: nextCouponIdFrom + assignedCount - 1,
        status: "assigned",
      });
      // const shopCoupon = await ShopCoupon.bulkCreate(req.body,{validate:true});
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  assignUserCoupon: async (req, res) => {
    const { shopId, userId, assignedCount } = req.body;
    const t = await sequelize.transaction();
    try {
      const shopBatches = await ShopCoupon.findAll({
        where: {
          shopId,
          status: "assigned",
        },
        order: [["couponIdFrom", "ASC"]],
        transaction: t,
      });

      if (!shopBatches.length) {
        return res.status(404).json({
          success: false,
          message: "No assigned coupon batches for this shop",
        });
      }

      let remaining = assignedCount;
      const assignments = [];

      for (const batch of shopBatches) {
        if (remaining <= 0) break;

        const { couponIdFrom, couponIdTo } = batch;

        const last = await UserCoupon.findOne({
          where: {
            shopId,
            couponIdFrom: { [Op.gte]: couponIdFrom },
            couponIdTo: { [Op.lte]: couponIdTo },
          },
          order: [["couponIdTo", "DESC"]],
          transaction: t,
        });

        const nextFrom = last ? last.couponIdTo + 1 : couponIdFrom;
        const batchAvailable = couponIdTo - nextFrom + 1;

        if (batchAvailable <= 0) continue;

        const countFromThisBatch = Math.min(remaining, batchAvailable);
        const nextTo = nextFrom + countFromThisBatch - 1;

        assignments.push({
          shopId,
          userId,
          assignedCount: countFromThisBatch,
          couponIdFrom: nextFrom,
          couponIdTo: nextTo,
        });
        remaining -= countFromThisBatch;
      }
      if (remaining > 0) {
        return res.status(404).json({
          success: false,
          message: "Not enough coupons available to fulfill the request",
        });
      }
      for (const data of assignments) {
        await UserCoupon.create(data, { transaction: t });
      }
      const totalAssigned = await UserCoupon.sum("assignedCount", {
        where: { userId },
        transaction: t,
      });
      await User.update(
        { couponCount: totalAssigned },
        { where: { id: userId }, transaction: t }
      );
      await t.commit();
      // await UserCoupon.bulkCreate(req.body,{validate:true});
      return res.status(200).json({
        success: true,
        message: "Coupons successfully assigned to user",
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCouponRequests: async (req, res) => {
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { status: "pending" };
    if (searchQuery) {
      whereCondition = {
        [Op.or]: [{ "$shop.shopName$": { [Op.like]: `%${searchQuery}%` } }],
      };
    }
    try {
      // const { count, rows: coupenRequests } = await ShopCoupon.findAndCountAll({
      //   limit,
      //   offset,
      //   where: whereCondition,
      //   attributes: ["id", "requestedCount"],
      //   include: [
      //     {
      //       model: Shop,
      //       attributes: ["id", "shopName"],
      //       as: "shop",
      //     },
      //     {
      //       model: UserCoupon,
      //       attributes: [
      //         [
      //           Sequelize.fn("SUM", Sequelize.col("assignedCount")),
      //           "distributedCount",
      //         ],
      //       ],
      //       as: "userCoupons",
      //       required: false,
      //     },
      //   ],
      //   group: ["ShopCoupon.id", "shop.id"],
      //   attributes: {
      //     include: [
      //       [
      //         Sequelize.literal(
      //           "assignedCount - COALESCE(SUM(userCoupons.assignedCount), 0)"
      //         ),
      //         "remainingCount",
      //       ],
      //     ],
      //   },
      // });
      // const { count, rows: couponRequests } = await ShopCoupon.findAndCountAll({
      //   limit,
      //   offset,
      //   where: whereCondition,
      //   include: [
      //     {
      //       model: Shop,
      //       attributes: ["id", "shopName"],
      //       as: "shop",
      //     },
      //     {
      //       model: UserCoupon,
      //       as: "userCoupons",
      //       attributes: [],
      //     },
      //   ],
      //   attributes: {
      //     include: [
      //       [
      //         Sequelize.literal(
      //           "assignedCount - COALESCE((SELECT SUM(uc.assignedCount) FROM usercoupons uc WHERE uc.shopId = ShopCoupon.shopId), 0)"
      //         ),
      //         "remainingCount",
      //       ],
      //     ],
      //   },
      //   group: ["ShopCoupon.id", "shop.id"],
      // });
      const { count, rows: couponRequests } = await ShopCoupon.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        include: [
          {
            model: Shop,
            attributes: ["id", "shopName"],
            as: "shop",
          },
        ],
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COALESCE(SUM(uc.assignedCount), 0) 
                FROM usercoupons uc 
                WHERE uc.shopId = ShopCoupon.shopId
              )`
              ),
              "distributedCount",
            ],
            [
              Sequelize.literal(
                `(SELECT COALESCE(SUM(sc.assignedCount), 0) 
                FROM shopcoupons sc 
                WHERE sc.shopId = ShopCoupon.shopId
              )`
              ),
              "totalAssignedCount",
            ],
            [
              Sequelize.literal(
                `((SELECT COALESCE(SUM(sc.assignedCount),0) 
                FROM ShopCoupons sc
                WHERE sc.shopId = ShopCoupon.shopId
                 ) -
              (SELECT COALESCE(SUM(uc.assignedCount), 0) 
                FROM usercoupons uc 
                WHERE uc.shopId = ShopCoupon.shopId
              ))`
              ),
              "remainingCount",
            ],
          ],
          exclude: [
            "couponIdFrom",
            "couponIdTo",
            "status",
            "createdAt",
            "updatedAt",
            "assignedCount",
          ],
        },
        order: [["createdAt", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        couponRequests,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getAssignedCoupon: async (req, res) => {
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { status: "assigned" };
    if (searchQuery) {
      whereCondition = {
        [Op.or]: [{ "$shop.shopName$": { [Op.like]: `%${searchQuery}%` } }],
      };
    }
    try {
      const { count, rows: assignedCoupons } = await ShopCoupon.findAndCountAll(
        {
          limit,
          offset,
          where: whereCondition,
          include: [
            {
              model: Shop,
              attributes: ["id", "shopName"],
              as: "shop",
            },
          ],
        }
      );
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        assignedCoupons,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCouponHistory: async (req, res) => {
    const searchQuery = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (searchQuery) {
      whereCondition = {
        [Op.or]: [
          { "$shop.shopName$": { [Op.like]: `%${searchQuery}%` } },
          { "$user.userName$": { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }
    try {
      const { count, rows: CouponHistory } = await UserCoupon.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "couponIdFrom", "couponIdTo", "assignedCount"],
        include: [
          {
            model: Shop,
            as: "shop",
            attributes: ["id", "shopName"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "userName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        CouponHistory,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShops: async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition = {
        shopName: { [Op.like]: `%${search}%` },
      };
    }
    try {
      const shops = await Shop.findAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "shopName"],
      });
      res.status(200).json({ success: true, shops });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
