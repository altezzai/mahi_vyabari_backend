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
        get() {
          const rawValue = this.getDataValue("categories");
          try {
            const parsed = rawValue ? JSON.parse(rawValue) : [];
            return Array.isArray(parsed) ? parsed.map(Number) : [];
          } catch (e) {
            return [];
          }
        },
        set(value) {
          this.setDataValue("categories", JSON.stringify(value));
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
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: "areas",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
