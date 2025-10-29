// src/seed.js
const Country = require("./models/country");
const sequelize = require("./utils/db");

async function seed() {
  await sequelize.sync({ force: true });
  await Country.bulkCreate([
    { name: "Nigeria", population: 200000000, currency_code: "NGN" },
    { name: "USA", population: 330000000, currency_code: "USD" },
  ]);
  console.log("Database seeded!");
}

seed();
