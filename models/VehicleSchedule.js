module.exports = (sequelize, DataTypes) => {
  const VehicleSchedule = sequelize.define(
    "VehicleSchedule",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      category: {
        type: DataTypes.ENUM("train", "bus"),
      },
      vehicleName: {
        type: DataTypes.STRING,
      },
      vehicleNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      from: {
        type: DataTypes.STRING,
        defaultValue: "mahe",
      },
      via: {
        type: DataTypes.STRING,
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departureTime: {
        type: DataTypes.STRING,
      },
      arrivalTime: {
        type: DataTypes.STRING,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "vehicleschedules",
      timestamps: true,
    }
  );

  return VehicleSchedule;
};
