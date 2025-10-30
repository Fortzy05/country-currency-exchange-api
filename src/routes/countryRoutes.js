const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const sequelize = require("../utils/db");
const { Op, fn, col } = require("sequelize");

const Country = require("../models/country");
const { refreshCountries } = require("../services/refreshService");

// POST /countries/refresh
router.post("/refresh", async (req, res) => {
  try {
    const result = await refreshCountries();
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(503).json({
      error: "External data source unavailable",
      details: err.message,
    });
  }
});

// GET /countries/image  (place before /:name)
router.get("/image", (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "cache", "summary.png");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Summary image not found" });
    }
    res.setHeader("Content-Type", "image/png");
    res.sendFile(filePath);
  } catch (err) {
    console.error("Image error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /countries
router.get("/", async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    const where = {};

    if (region) {
      where[Op.and] = sequelize.where(
        fn("lower", col("region")),
        region.toLowerCase()
      );
    }
    if (currency) {
      // filter by currency_code case-insensitive
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        sequelize.where(
          fn("lower", col("currency_code")),
          currency.toLowerCase()
        )
      );
    }

    // Default sort: GDP desc
    const order = [["estimated_gdp", "DESC"]];
    if (sort === "gdp_asc") order[0] = ["estimated_gdp", "ASC"];
    if (sort === "gdp_desc") order[0] = ["estimated_gdp", "DESC"];

    const countries = await Country.findAll({ where, order });
    res.status(200).json(countries);
  } catch (err) {
    console.error("Fetch countries error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /countries/:name
router.get("/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: sequelize.where(fn("lower", col("name")), name.toLowerCase()),
    });
    if (!country) return res.status(404).json({ error: "Country not found" });
    res.status(200).json(country);
  } catch (err) {
    console.error("Fetch country error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /countries/:name
router.delete("/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: sequelize.where(fn("lower", col("name")), name.toLowerCase()),
    });
    if (!country) return res.status(404).json({ error: "Country not found" });
    await country.destroy();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete country error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
