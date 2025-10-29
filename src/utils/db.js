// src/utils/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // should be 'country_db'
  process.env.DB_USER, // 'root'
  process.env.DB_PASSWORD, // ''
  {
    host: process.env.DB_HOST, // 'localhost'
    port: process.env.DB_PORT, // 3306
    dialect: "mysql",
    logging: false, // optional
  }
);

module.exports = sequelize;
