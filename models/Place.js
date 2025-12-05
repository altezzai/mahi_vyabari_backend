module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define(
    "Place",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      primary: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "places",
      timestamps: true,
    }
  );
  return Place;
};
