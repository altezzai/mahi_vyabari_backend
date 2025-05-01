const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Type = require("./Type");
const Category = sequelize.define(
  "Category",
  {
    userId: {
      type: DataTypes.INTEGER,
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Type,
        key: "id",
      },
      validate: {
        notEmpty: true,
      },
    },
    icon: {
      type: DataTypes.STRING,
    },
    categoryName: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  }
);

Type.hasMany(Category, { foreignKey: "typeId",as:"category" });
Category.belongsTo(Type, { foreignKey: "typeId",as:"type"});

module.exports = Category;
