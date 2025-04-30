const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const WorkerProfile = sequelize.define(
  "Worker",
  {
    workerName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    categories: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue("categories");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("images", JSON.stringify(value));
      },
    },
    minWage: {
      type: DataTypes.DECIMAL(10, 2),
    },
    priority: {
      type: DataTypes.ENUM("A", "B", "C"),
      validate: {
        isIn: [["A", "B", "C"]],
      },
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
