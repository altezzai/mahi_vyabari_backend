const {
  CouponMilestone,
  Rewards,
  User,
  Area,
  UserCoupon,
  Shop,
} = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const {
  compressAndSaveFile,
  deleteFileWithFolderName,
} = require("../utils/fileHandler");
const uploadPath = "public/uploads/gifts/";

module.exports = {
  // ➤ CREATE
  createMilestone: async (req, res) => {
    try {
      const { required_coupons, gift_description } = req.body;

      let fileName = null;
      if (req.file) {
        fileName = await compressAndSaveFile(req.file, uploadPath);
      }
      if (!required_coupons) {
        return res.status(400).json({ error: "required_coupons is required" });
      }

      const milestone = await CouponMilestone.create({
        required_coupons,
        gift_image: fileName,
        gift_description,
      });

      return res.status(201).json({
        message: "Milestone created successfully",
        data: milestone,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ GET ALL
  getAllMilestones: async (req, res) => {
    try {
      const milestones = await CouponMilestone.findAll({
        order: [["required_coupons", "ASC"]],
      });

      return res.status(200).json({ data: milestones });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ GET BY ID
  getMilestoneById: async (req, res) => {
    try {
      const { id } = req.params;

      const milestone = await CouponMilestone.findOne({ where: { id } });

      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }

      return res.status(200).json({ data: milestone });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ UPDATE
  updateMilestone: async (req, res) => {
    try {
      const { id } = req.params;
      const { required_coupons, gift_description } = req.body;

      const milestone = await CouponMilestone.findOne({ where: { id } });

      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }

      let fileName = milestone.gift_image;
      if (req.file) {
        const oldFilename = fileName;
        fileName = await compressAndSaveFile(req.file, uploadPath);
        if (oldFilename) {
          await deleteFileWithFolderName(uploadPath, oldFilename);
        }
      }

      await milestone.update({
        required_coupons,
        gift_image: fileName,
        gift_description,
      });

      return res.status(200).json({
        message: "Milestone updated successfully",
        data: milestone,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ DELETE
  deleteMilestone: async (req, res) => {
    try {
      const { id } = req.params;

      const milestone = await CouponMilestone.findOne({ where: { id } });

      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      if (milestone.gift_image) {
        await deleteFileWithFolderName(uploadPath, milestone.gift_image);
      }

      await milestone.destroy();

      return res
        .status(200)
        .json({ message: "Milestone deleted successfully" });
    } catch (error) {
      console.error(error);
      logger.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
  createReward: async (req, res) => {
    try {
      const {
        user_id,
        milestone_id,
        coupon_id,
        coupon_Number,
        gift,
        user_address,
      } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: "user_id  are required" });
      }

      const newReward = await Rewards.create({
        user_id,
        milestone_id,
        coupon_id,
        coupon_Number,
        gift,
        user_address,
      });

      return res.status(201).json({
        message: "Reward created successfully",
        data: newReward,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ GET ALL Rewards
  getAllRewards: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: rewardList } = await Rewards.findAndCountAll({
        limit,
        offset,
        distinct: true,
        order: [["id", "DESC"]],
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
          {
            model: User,
            attributes: ["id", "image", "userName", "email", "phone"],
            include: [
              {
                model: Area,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: UserCoupon,
            attributes: ["id", "couponIdFrom", "couponIdTo", "assignedCount"],
            include: [
              {
                model: Shop,
                attributes: ["id", "shopName"],
                as: "shop",
              },
            ],
          },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        totalContent: count,
        totalPages,
        currentPage: page,
        data: rewardList,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ GET Reward By ID
  getRewardById: async (req, res) => {
    try {
      const { id } = req.params;

      const reward = await Rewards.findOne({
        where: { id },
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
          {
            model: User,
            attributes: ["id", "image", "userName", "email", "phone"],
            include: [
              {
                model: Area,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: UserCoupon,
            attributes: ["id", "couponIdFrom", "couponIdTo", "assignedCount"],
            include: [
              {
                model: Shop,
                attributes: ["id", "shopName"],
                as: "shop",
              },
            ],
          },
        ],
      });

      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }

      return res.status(200).json({ data: reward });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ UPDATE Reward
  updateReward: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        user_id,
        milestone_id,
        coupon_id,
        coupon_Number,
        gift,
        user_address,
      } = req.body;

      const reward = await Rewards.findOne({ where: { id } });

      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }

      await reward.update({
        user_id,
        milestone_id,
        coupon_id,
        coupon_Number,
        gift,
        user_address,
      });

      return res.status(200).json({
        message: "Reward updated successfully",
        data: reward,
      });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },

  // ➤ DELETE Reward
  deleteReward: async (req, res) => {
    try {
      const { id } = req.params;

      const reward = await Rewards.findOne({ where: { id } });

      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }

      await reward.destroy();

      return res.status(200).json({ message: "Reward deleted successfully" });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  getUserRewards: async (req, res) => {
    try {
      const userId = req.user.id;
      const rewards = await Rewards.findAll({
        where: { user_id: userId },
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
          {
            model: UserCoupon,
            attributes: ["id", "couponIdFrom", "couponIdTo", "assignedCount"],
            include: [
              {
                model: Shop,
                attributes: ["id", "shopName"],
                as: "shop",
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.status(200).json({ data: rewards });
    } catch (error) {
      console.error(error);
      logger.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
};
