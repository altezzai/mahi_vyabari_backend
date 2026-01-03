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
const logger = require("../utils/logger");

module.exports = {
  requestCoupon: async (req, res) => {
    const { requestedCount } = req.body;
    const shopId = req.user.shopId;
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
      logger.error("  error in requestCoupon", error);

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
      // const lastAssigned = await ShopCoupon.findOne({
      //   order: [["couponIdTo", "DESC"]],
      //   attributes: ["couponIdTo"],
      // });
      // let nextCouponIdFrom = 1;
      // if (lastAssigned && lastAssigned.couponIdTo) {
      //   nextCouponIdFrom = lastAssigned.couponIdTo + 1;
      // }
      await shopCoupon.update({
        assignedCount,
        // couponIdFrom: nextCouponIdFrom,
        // couponIdTo: nextCouponIdFrom + Number(assignedCount) - 1,
        status: "assigned",
      });
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      logger.error("error in assignShopCouponRequest", error);

      res.status(500).json({ success: false, message: error.message });
    }
  },
  assignShopCoupon: async (req, res) => {
    const { assignedCount, shopId } = req.body;
    try {
      // const lastAssigned = await ShopCoupon.findOne({
      //   order: [["couponIdTo", "DESC"]],
      //   attributes: ["couponIdTo"],
      // });
      // let nextCouponIdFrom = 1;
      // if (lastAssigned && lastAssigned.couponIdTo) {
      //   nextCouponIdFrom = lastAssigned.couponIdTo + 1;
      // }
      const shopCoupon = await ShopCoupon.create({
        shopId,
        assignedCount,
        // couponIdFrom: nextCouponIdFrom,
        // couponIdTo: nextCouponIdFrom + Number(assignedCount) - 1,
        status: "assigned",
      });
      res.status(200).json({ success: true, shopCoupon });
    } catch (error) {
      console.log(error);
      logger.error("error in assignShopCoupon", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  assignUserCoupon: async (req, res) => {
    const { userId, assignedCount } = req.body;
    const recordedBy = req.user.id;
    const shopId = req.user.shopId;
    const t = await sequelize.transaction();
    try {
      if (!userId || !assignedCount) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }
      const totalShopCoupons =
        (await ShopCoupon.sum("assignedCount", {
          where: { shopId },
        })) || 0;

      const totalUserAssigned =
        (await UserCoupon.sum("assignedCount", {
          where: { shopId },
        })) || 0;
      if (totalUserAssigned + Number(assignedCount) > totalShopCoupons) {
        return res.status(400).json({
          success: false,
          message: "Not enough coupons available to assign",
        });
      }
      const lastUserCoupon = await UserCoupon.findOne({
        order: [["couponIdTo", "DESC"]],
      });
      let nextCouponIdFrom = 1;
      if (lastUserCoupon && lastUserCoupon.couponIdTo) {
        nextCouponIdFrom = lastUserCoupon.couponIdTo + 1;
      }
      const userCoupon = await UserCoupon.create(
        {
          shopId,
          userId,
          assignedCount,
          couponIdFrom: nextCouponIdFrom,
          couponIdTo: nextCouponIdFrom + Number(assignedCount) - 1,
          recordedBy,
        },
        { transaction: t }
      );

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
        userCoupon,
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      logger.error("error in assignUserCoupon", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  adminAssignUserCoupon: async (req, res) => {
    const { userId, assignedCount, shopId } = req.body;
    const recordedBy = req.user.id;
    const t = await sequelize.transaction();
    try {
      if (!shopId || !userId || !assignedCount) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }
      const totalShopCoupons =
        (await ShopCoupon.sum("assignedCount", {
          where: { shopId },
        })) || 0;

      const totalUserAssigned =
        (await UserCoupon.sum("assignedCount", {
          where: { shopId },
        })) || 0;
      if (totalUserAssigned + Number(assignedCount) > totalShopCoupons) {
        return res.status(400).json({
          success: false,
          message: "Not enough coupons available to assign",
        });
      }
      const lastUserCoupon = await UserCoupon.findOne({
        order: [["couponIdTo", "DESC"]],
      });
      let nextCouponIdFrom = 1;
      if (lastUserCoupon && lastUserCoupon.couponIdTo) {
        nextCouponIdFrom = lastUserCoupon.couponIdTo + 1;
      }
      const userCoupon = await UserCoupon.create(
        {
          shopId,
          userId,
          assignedCount,
          couponIdFrom: nextCouponIdFrom,
          couponIdTo: nextCouponIdFrom + Number(assignedCount) - 1,
          recordedBy,
        },
        { transaction: t }
      );

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
        userCoupon,
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      logger.error("error in adminAssignUserCoupon", error);
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
          exclude: ["status", "createdAt", "updatedAt", "assignedCount"],
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
      logger.error("error in getCouponRequests", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getShopCouponsHistory: async (req, res) => {
    const shopId = req.user.shopId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereCondition = { shopId };

    try {
      const { count, rows: ShopCouponHistory } =
        await ShopCoupon.findAndCountAll({
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
      logger.error("error in getShopCouponsHistory", error);

      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getAssignedCoupon: async (req, res) => {
    const searchQuery = req.query.q || "";
    const shopId = req.query.shopId || null;
    const start_date = req.query.start_date || null;
    const end_date = req.query.end_date || null;

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

    let whereCondition = { status: "assigned" };

    if (searchQuery) {
      whereCondition = {
        [Op.or]: [{ "$shop.shopName$": { [Op.like]: `%${searchQuery}%` } }],
      };
    }
    if (shopId) {
      whereCondition.shopId = shopId;
    }
    if (start_date) {
      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);
      whereCondition.createdAt = {
        ...whereCondition.createdAt,
        [Op.gte]: new Date(startDate),
      };
    }
    if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdAt = {
        ...whereCondition.createdAt,
        [Op.lte]: new Date(endDate),
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
          order: [["createdAt", "DESC"]],
        }
      );
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        assignedCoupons,
      });
    } catch (error) {
      console.log(error);
      logger.error("error in getAssignedCoupon", error);

      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCouponHistory: async (req, res) => {
    const searchQuery = req.query.q || "";
    const download = req.query.download || "";
    const shopId = req.query.shopId || null;
    const userId = req.query.userId || null;
    const start_date = req.query.start_date || null;
    const end_date = req.query.end_date || null;
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
    if (shopId) {
      whereCondition.shopId = shopId;
    }
    if (userId) {
      whereCondition.userId = userId;
    }
    if (start_date) {
      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);
      whereCondition.createdAt = {
        ...whereCondition.createdAt,
        [Op.gte]: new Date(startDate),
      };
    }
    if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdAt = {
        ...whereCondition.createdAt,
        [Op.lte]: new Date(endDate),
      };
    }
    try {
      const { count, rows: CouponHistory } = await UserCoupon.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
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
      logger.error("error in getCouponHistory", error);

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
      logger.error("error in getShops", error);

      res.status(500).json({ success: false, message: error.message });
    }
  },
  getUsers: async (req, res) => {
    const search = req.query.search.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition = { role: "user", trash: false };
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { userName: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { id: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    try {
      const { count, rows: customers } = await User.findAndCountAll({
        limit,
        offset,
        where: whereCondition,
        attributes: ["id", "userName", "phone"],
        order: [["id", "ASC"]],
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
      logger.error("error in getUsers", error);

      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getRecentUserCoupons: async (req, res) => {
    const shopId = req.user.shopId;
    try {
      const couponHistory = await UserCoupon.findAndCountAll({
        where: { shopId: shopId },
        limit: 20,
        attributes: ["id", "couponIdFrom", "couponIdTo", "createdAt"],
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
      logger.error("error in getRecentUserCoupons", error);

      res.status(500).json({ success: false, message: error.message });
    }
  },
  getCurrentShopCouponStatus: async (req, res) => {
    const shopId = req.user.shopId;
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

            "createdAt",
            "updatedAt",
          ],
        },
      });
      res.status(200).json({ success: true, couponStatus });
    } catch (error) {
      console.log(error);
      logger.error("error in getCurrentShopCouponStatus", error);

      res.status(500).json({ success: false, message: error.message });
    }
  },
  getPendingCoupons: async (req, res) => {
    const shopId = req.user.shopId;
    try {
      const pendingCoupons = await ShopCoupon.sum("requestedCount", {
        where: { status: "pending", shopId },
      });
      res.status(200).json({ success: true, pendingCoupons });
    } catch (error) {
      console.log(error);
      logger.error("error in getPendingCoupons", error);

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
      logger.error("error in getUserCouponStatus", error);

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
      logger.error("error in getCouponRange", error);

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
        return res.status(400).json({
          message: " invalid coupon number selected. Please try again.",
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
      logger.error("error in luckDraw", error);

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
      logger.error("error in getUserMilestone", error);

      res.status(500).json({ success: false, message: error.message });
    }
  },
};
