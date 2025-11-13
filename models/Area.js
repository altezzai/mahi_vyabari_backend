module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define(
    "Area",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "areas",
      timestamps: true,
    }
  );
  return Area;
};
