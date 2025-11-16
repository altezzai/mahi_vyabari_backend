module.exports = (sequelize, DataTypes) => {
  const VehicleService = sequelize.define(
    "VehicleService",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      ownerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.INTEGER.UNSIGNED,
      },
      minFee: {
        type: DataTypes.DECIMAL(10, 2),
      },
      vehicleNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM("A", "B", "C"),
        validate: {
          isIn: [["A", "B", "C"]],
        },
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
      description: {
        type: DataTypes.TEXT,
      },
      area_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "areas",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      address: {
        type: DataTypes.TEXT,
      },
      image: {
        type: DataTypes.STRING,
      },
      icon: {
        type: DataTypes.STRING,
      },
      trash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "vehicleservice",
      timestamps: true,
    }
  );
  return VehicleService;
};