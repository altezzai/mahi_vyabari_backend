const Shop = require("../models/Shop");
const Feedback = require("../models/Feedback");
const { Sequelize } = require("sequelize");

module.exports = {
  homePage: async (req, res) => {
    try {
      const shops = await Shop.findAll({
        attributes: [
          "id",
          "shopName",
          [
            Sequelize.fn("AVG", Sequelize.col("Feedbacks.rating")),
            "averageRating",
          ],
        ],
        include: [
          {
            model: Feedback,
            attributes: [],
            as: "Feedbacks",
          },
        ],
        group: ["Shop.id"],
        order: [[Sequelize.literal("averageRating"), "DESC"]],
      });
      console.log("✅ Shops sorted by rating:", JSON.stringify(shops, null, 2));
      res.json({ message: "Top-rated shops", data: shops });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching shops", error });
    }
  },
};
