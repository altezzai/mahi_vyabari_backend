const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

const ItemListing = sequelize.define(
  "Classified",
  {
    userId: {
      type: DataTypes.INTEGER,
    },
    category: {
      type: DataTypes.INTEGER,
      references:{
        model:Category,
        key:"id"
      }
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
      type: DataTypes.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      validate: {
        isIn: [["mahe", "chokli", "palloor", "pandakkal"]],
      },
    },
    address: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.ENUM("A","B","C"),
      validate:{
        isIn:[["A","B","C"]]
      }
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
    tableName: "classifieds",
  }
);
Category.hasMany(ItemListing,{foreignKey:"category",as:"itemCategory"})
ItemListing.belongsTo(Category,{foreignKey:"category",as:"itemCategory"})
module.exports = ItemListing;
