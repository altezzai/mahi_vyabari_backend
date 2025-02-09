const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shop = sequelize.define('Shop', {
  shopImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopIconImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  whatsapp: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(500),
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  openingTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  closingTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  workingDays: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull:false
  },
  areas: {
    type: DataTypes.STRING,  
    allowNull: false,
  },
  trash:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
  }
}, {
  tableName: 'shops', 
  timestamps: false,  
});

module.exports = Shop;
