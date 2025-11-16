module.exports = (sequelize, DataTypes) => {
  const ClassifiedImage = sequelize.define(
    "ClassifiedImage",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      classifiedId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "classified_images",
      timestamps: true,
    }
  );
  return ClassifiedImage;
};