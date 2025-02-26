const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HealthcareProvider = sequelize.define(
  "HealthcareProvider",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    searchCategory: {
      type: DataTypes.ENUM("doctor", "hospital"),
      allowNull: false,
      validate: {
        isIn: [["doctor", "hospital"]],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    searchSubcategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    workingDays: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      validate: {
        isIn: [["A", "B", "C"]],
      },
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "HealthcareProvider",
  }
);

module.exports = HealthcareProvider;
