const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Worker = require("./Worker");
const Category = require("./Category");

const WorkerCategory = sequelize.define(
  "WorkerCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Worker,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "workercategories",
    timestamps: true,
    underscored: true,
  }
);

Worker.belongsToMany(Category, {
  through: WorkerCategory,
  foreignKey: "workerId",
});
Category.belongsToMany(Worker, {
  through: WorkerCategory,
  foreignKey: "categoryId",
});

module.exports = WorkerCategory;
