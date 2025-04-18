const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

const VehicleService = sequelize.define(
  "VehicleService",
  {
    ownerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
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
    area: {
      type: DataTypes.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      validate: {
        isIn: [["mahe", "chokli", "palloor", "pandakkal"]],
      },
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

Category.hasMany(VehicleService, {
  foreignKey: "category",
  as: "taxiCategory",
});
VehicleService.belongsTo(Category, {
  foreignKey: "category",
  as: "taxiCategory",
});

module.exports = VehicleService;
