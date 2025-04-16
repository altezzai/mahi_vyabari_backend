const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Assuming you have a User model
const Shop = require("./Shop"); // Assuming you have a Shop model

const Complaint = sequelize.define(
  "Complaint",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved", "rejected"),
      defaultValue: "pending",
    },
    resolution: {
      type: DataTypes.TEXT,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "complaints",
  }
);

// Associations (If Needed)
User.hasMany(Complaint, { foreignKey: "userId" });
Shop.hasMany(Complaint, { foreignKey: "shopId", as: "complaints" });
Complaint.belongsTo(User, { foreignKey: "userId" });
Complaint.belongsTo(Shop, { foreignKey: "shopId" });

module.exports = Complaint;
