const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Shop = require("./Shop");

module.exports = (sequelize, DataTypes) => {
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
  return Complaint;
};

// Associations (If Needed)
// User.hasMany(Complaint, { foreignKey: "userId"});
// Shop.hasMany(Complaint, { foreignKey: "shopId", as: "complaints" });
// Complaint.belongsTo(User, { foreignKey: "userId", as:"user"});
// Complaint.belongsTo(Shop, { foreignKey: "shopId",as:"shop" });
