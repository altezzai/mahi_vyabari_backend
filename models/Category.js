module.exports = (sequelize, DataTypes) => {
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
          model:"types",
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
  return Category;
};
