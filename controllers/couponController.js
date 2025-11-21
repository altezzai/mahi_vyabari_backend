const sequelize = require("../config/database");
const { Op, fn, col, Sequelize, literal } = require("sequelize");
const {
  User,
  ShopCoupon,
  UserCoupon,
  Shop,
  Rewards,
  CouponMilestone,
} = require("../models");
const { parse } = require("dotenv");

module.exports = {
  requestCoupon: async (req, res) => {
    const { requestedCount } = req.body;
    const { id } = req.user;
    const shopDetails = await Shop.findOne({ where: { userId: id } });
    const shopId = shopDetails.id;
    const couponData = {
      status: "pending",
      requestedCount,
      shopId,
    };
    try {
      const shopCoupon = await ShopCoupon.create(couponData);
      res.status(200).json({
        success: true,
        shopCoupon,
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
    console.log(assignedCount);
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
        couponIdTo: nextCouponIdFrom + Number(assignedCount) - 1,
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
      let nextCouponIdFrom = 1;
      if (lastAssigned && lastAssigned.couponIdTo) {
        nextCouponIdFrom = lastAssigned.couponIdTo + 1;
      }
      const shopCoupon = await ShopCoupon.create({
        shopId,
        assignedCount,
        couponIdFrom: nextCouponIdFrom,
        couponIdTo: nextCouponIdFrom + Number(assignedCount) - 1,
        status: "assigned",
      });
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  assignUserCoupon: async (req, res) => {
    const { userId, assignedCount } = req.body;
    const { id } = req.user;
    const shopDetails = await Shop.findOne({ where: { userId: id } });
    const shopId = shopDetails.id;
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

      let remaining = Number(assignedCount);
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
                FROM shopcoupons sc
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
  getShopCouponsHistory: async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const shopDetails = await Shop.findOne({ where: { userId } });
    const shopId = shopDetails.id;
    let whereCondition = { shopId };

    try {
      const { count, rows: ShopCouponHistory } =
        await ShopCoupon.findAndCountAll({
          limit,
          offset,
          where: whereCondition,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Shop,
              attributes: ["id", "shopName"],
              as: "shop",
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
        ShopCouponHistory,
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
    const download = req.query.download || "";
    let { page = 1, limit = 10 } = req.query;
    if (download === "true") {
      page = null;
      limit = null;
    } else {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
    }

    const offset = page && limit ? (page - 1) * limit : 0;

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
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
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
  getUsers: async (req, res) => {
    const search = req.query.search.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { role: "user" };
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userName: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: customers } = await User.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "userName"],
        order: [["createdAt", "DESC"]],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: customers,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getRecentUserCoupons: async (req, res) => {
    const { id } = req.user;
    const shopDetails = await Shop.findOne({ where: { userId: id } });
    const shopId = shopDetails.id;
    try {
      const couponHistory = await UserCoupon.findAndCountAll({
        where: { shopId: shopId },
        limit: 20,
        attributes: ["id", "couponIdFrom", "couponIdTo"],
        include: [
          {
            model: User,
            attributes: ["id", "userName", "image"],
            as: "user",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json({
        success: true,
        couponHistory,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getCurrentShopCouponStatus: async (req, res) => {
    const shopId = req.user.id;
    try {
      if (!shopId) {
        return res
          .status(400)
          .json({ success: false, message: "Shop ID is required" });
      }
      const couponStatus = await ShopCoupon.findOne({
        where: { shopId },
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COALESCE(SUM(sc.assignedCount),0) 
                FROM shopcoupons sc 
                WHERE sc.shopId = ShopCoupon.shopId)`
              ),
              "totalCoupon",
            ],
            [
              Sequelize.literal(
                `((SELECT COALESCE(SUM(sc.assignedCount),0) 
                FROM shopcoupons sc 
                WHERE sc.shopId = ShopCoupon.shopId)
                -
                (SELECT COALEsCE(SUM(uc.assignedCount),0) 
                FROM usercoupons uc 
                WHERE uc.shopId = ShopCoupon.shopId))`
              ),
              "remainingCoupon",
            ],
          ],
          exclude: [
            "requestedCount",
            "assignedCount",
            "status",
            "couponIdFrom",
            "couponIdTo",
            "createdAt",
            "updatedAt",
          ],
        },
      });
      res.status(200).json({ success: true, couponStatus });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getPendingCoupons: async (req, res) => {
    const { id } = req.user;
    const shopDetails = await Shop.findOne({ where: { userId: id } });
    const shopId = shopDetails.id;
    try {
      const pendingCoupons = await ShopCoupon.sum("requestedCount", {
        where: { status: "pending", shopId },
      });
      res.status(200).json({ success: true, pendingCoupons });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getUserCouponStatus: async (req, res) => {
    const { id } = req.user;
    try {
      const totalCouponCount = await User.findByPk(id, {
        attributes: ["couponCount"],
      });
      const userCouponStatus = await UserCoupon.findAll({
        where: { userId: id },
        attributes: [
          "id",
          "couponIdFrom",
          "couponIdTo",
          "assignedCount",
          "createdAt",
        ],
        include: [
          {
            model: Shop,
            attributes: ["id", "shopName", "image"],
            as: "shop",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res
        .status(200)
        .json({ success: true, data: { totalCouponCount, userCouponStatus } });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getCouponRange: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate and endDate required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const data = await UserCoupon.findOne({
        attributes: [
          [fn("MIN", col("couponIdFrom")), "firstCouponIdFrom"],
          [fn("MAX", col("couponIdTo")), "lastCouponIdTo"],
        ],
        where: {
          createdAt: {
            [Op.between]: [start, end],
          },
        },
        raw: true,
      });
      if (!data || data.firstCouponIdFrom === null) {
        return res
          .status(404)
          .json({ message: "No coupons found in date range" });
      }

      return res.status(200).json({
        startDate,
        endDate,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  luckDraw: async (req, res) => {
    try {
      let { couponIdFrom, couponIdTo } = req.query;

      if (!couponIdFrom || !couponIdTo) {
        return res
          .status(400)
          .json({ error: "couponIdFrom and couponIdTo required" });
      }
      couponIdFrom = parseInt(couponIdFrom);
      couponIdTo = parseInt(couponIdTo);

      const randomCouponId =
        Math.floor(Math.random() * (couponIdTo - couponIdFrom + 1)) +
        couponIdFrom;
      const result = await UserCoupon.findOne({
        where: {
          couponIdFrom: { [Op.lte]: randomCouponId },
          couponIdTo: { [Op.gte]: randomCouponId },
        },
        include: [
          {
            model: User,
            attributes: ["id", "userName", "email", "phone", "image"],
            as: "user",
          },
          {
            model: Shop,
            attributes: ["id", "shopName", "image"],
            as: "shop",
          },
        ],
      });

      if (!result) {
        return res.status(404).json({
          message: "No user matched with the selected coupon number.",
          randomCouponId,
        });
      }

      return res.status(200).json({
        message: "Luck draw success!",
        randomCouponId,
        userDetails: result.user,
        shopId: result.shop,
        couponId: result.id,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  getUserMilestone: async (req, res) => {
    const { id } = req.user;

    try {
      const lastMilestone = await Rewards.findOne({
        where: { user_id: id },
        attributes: ["coupon_Number", "milestone_id", "createdAt"],
        include: [
          {
            model: CouponMilestone,
            attributes: [
              "id",
              "required_coupons",
              "gift_image",
              "gift_description",
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!lastMilestone) {
        const nextMilestone = await CouponMilestone.findOne({
          order: [["required_coupons", "ASC"]],
        });

        return res.status(200).json({
          success: true,
          data: {
            lastMilestone: null,
            nextMilestone,
          },
        });
      }
      if (!lastMilestone.CouponMilestone.id) {
        return res.status(200).json({
          success: true,
          data: {
            lastMilestone: null,
            nextMilestone: null,
          },
        });
      }

      const achievedMilestoneId = lastMilestone.CouponMilestone.id;

      const nextMilestone = await CouponMilestone.findOne({
        where: {
          id: { [Op.gt]: achievedMilestoneId },
        },
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: {
          lastMilestone,
          nextMilestone: nextMilestone || null,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
