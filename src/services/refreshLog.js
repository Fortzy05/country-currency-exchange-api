const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const RefreshLog = sequelize.define("RefreshLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  last_refreshed_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = RefreshLog;
