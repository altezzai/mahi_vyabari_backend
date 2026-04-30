const Service = require("./Service");
const Category = require("./Category");

module.exports = (sequelize, DataTypes) => {
  const ServiceCategory = sequelize.define(
    "ServiceCategory",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Service,
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
      tableName: "servicecategories",
      timestamps: true,
    }
  );
  return ServiceCategory;
};
