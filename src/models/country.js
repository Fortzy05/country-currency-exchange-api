const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const Country = sequelize.define(
  "Country",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    capital: { type: DataTypes.STRING, allowNull: true },
    region: { type: DataTypes.STRING, allowNull: true },
    population: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    currency_code: { type: DataTypes.STRING, allowNull: true },
    exchange_rate: { type: DataTypes.FLOAT, allowNull: true },
    estimated_gdp: { type: DataTypes.FLOAT, allowNull: true },
    flag_url: { type: DataTypes.STRING, allowNull: true },
    last_refreshed_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "Countries",
    timestamps: false,
  }
);

module.exports = Country;
