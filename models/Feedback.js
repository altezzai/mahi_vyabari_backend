const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Shop = require("./Shop");

const Feedback = sequelize.define(
  "Feedback",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Shop,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    tableName: "feedbacks",
    timestamps: true,
    indexes:[
      {
        unique:true,
        fields:["userId","shopId"]
      }
    ]
  }
);

// Associations (If Needed)
User.hasMany(Feedback, { foreignKey: "userId" });
Feedback.belongsTo(User, { foreignKey: "userId" });
Shop.hasMany(Feedback, { as: "feedbacks", foreignKey: "shopId" });
Feedback.belongsTo(Shop, { foreignKey: "shopId" });

module.exports = Feedback;
