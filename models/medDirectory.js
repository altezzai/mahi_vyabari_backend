const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

const HealthcareProvider = sequelize.define(
  "HealthcareProvider",
  {
    userId: {
      type: DataTypes.INTEGER,
    },
    image: {
      type: DataTypes.STRING,
    },
    icon: {
      type: DataTypes.STRING,
    },
    searchCategory: {
      type: DataTypes.ENUM("doctor", "hospital"),
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
    },
    whatsapp: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    address: {
      type: DataTypes.TEXT,
    },
    openingTime: {
      type: DataTypes.TIME,
    },
    closingTime: {
      type: DataTypes.TIME,
    },
    workingDays: {
      type: DataTypes.STRING,
    },
    priority: {
      type: DataTypes.CHAR(1),
      validate: {
        isIn: [["A", "B", "C"]],
      },
    },
    area: {
      type: DataTypes.STRING,
    },
    trash: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "HealthcareProviders",
  }
);

module.exports = HealthcareProvider;
