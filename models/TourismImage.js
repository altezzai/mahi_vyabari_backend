module.exports = (sequelize, DataTypes) => {
  const TourismImage = sequelize.define(
    "TourismImage",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      tourismId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "tourism_images",
      timestamps: true,
    }
  );
  return TourismImage;
};