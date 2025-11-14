module.exports = (sequelize, DataTypes) => {
  const WorkerProfile = sequelize.define(
    "Worker",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      workerName: {
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
        type: DataTypes.INTEGER.UNSIGNED,
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
      tableName: "workers",
      timestamps: true,
    }
  );
  return WorkerProfile;
};
