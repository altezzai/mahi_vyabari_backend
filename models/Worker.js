const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const WorkerProfile = sequelize.define(
  "Worker",
  {
    categories: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    minWage: {
      type: DataTypes.DECIMAL(10, 2),
    },
    priority: {
      type: DataTypes.INTEGER,
    },
    area: {
      type: DataTypes.ENUM("mahe", "chokli", "palloor", "pandakkal"),
      validate: {
        isIn: [["mahe", "chokli", "palloor", "pandakkal"]],
      },
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
      allowNull: false,
    },
    whatsapp: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
    icon: {
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
    tableName: "Workers",
    timestamps: true,
  }
);

module.exports = WorkerProfile;
