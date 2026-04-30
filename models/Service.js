module.exports = (sequelize, DataTypes) => {
  const ServiceProfile = sequelize.define(
    "Service",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      serviceName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      categories: {
        type: DataTypes.TEXT,
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
      area_id: {
        type: DataTypes.INTEGER,
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
      tableName: "services",
      timestamps: true,
    }
  );
  return ServiceProfile;
};
