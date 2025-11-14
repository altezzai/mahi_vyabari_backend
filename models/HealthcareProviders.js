module.exports = (sequelize, DataTypes) => {
  const HealthcareProvider = sequelize.define(
    "HealthcareProvider",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      image: {
        type: DataTypes.STRING,
      },
      icon: {
        type: DataTypes.STRING,
      },
      category: {
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
      subCategory: {
        type: DataTypes.INTEGER.UNSIGNED,
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
        type: DataTypes.STRING,
      },
      closingTime: {
        type: DataTypes.STRING,
      },
      workingDays: {
        type: DataTypes.STRING,
      },
      priority: {
        type: DataTypes.ENUM("A", "B", "C"),
        validate: {
          isIn: [["A", "B", "C"]],
        },
      },
      area_id: {
        type: DataTypes.INTEGER,
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
  return HealthcareProvider;
};
