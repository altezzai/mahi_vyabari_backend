const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ItemListing = sequelize.define(
  "Classified",
  {
    userId: {
      type: DataTypes.INTEGER,
    },
    category: {
      type: DataTypes.STRING,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    homeTown: {
      type: DataTypes.STRING,
    },
    area: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    whatsapp: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING, // Stores the image URL/path
    },
    icon: {
      type: DataTypes.STRING, // Stores the icon URL/path
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName:"classifieds",
  }
);

module.exports = ItemListing;
