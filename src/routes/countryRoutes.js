const express = require("express");
const fs = require("fs");
const router = express.Router();

const Country = require("../models/country");
const { refreshCountries } = require("../services/refreshService");

/**
 * POST /countries/refresh
 */
router.post("/refresh", async (req, res) => {
  try {
    const result = await refreshCountries();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: "Failed to refresh countries. External data source unavailable.",
      details: err.message,
    });
  }
});

/**
 * GET /countries
 * Supports filters: region, currency
 * Supports sort: gdp_desc | gdp_asc
 */
router.get("/", async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    const where = {};
    if (region) where.region = region;
    if (currency) where.currency_code = currency;

    const order = [];
    if (sort === "gdp_desc") order.push(["estimated_gdp", "DESC"]);
    if (sort === "gdp_asc") order.push(["estimated_gdp", "ASC"]);

    const countries = await Country.findAll({ where, order });
    res.json({ success: true, count: countries.length, data: countries });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch countries" });
  }
});

/**
 * GET /countries/:name
 */
router.get("/:name", async (req, res) => {
  try {
    const country = await Country.findOne({ where: { name: req.params.name } });
    if (!country)
      return res
        .status(404)
        .json({ success: false, error: "Country not found" });
    res.json({ success: true, data: country });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch country" });
  }
});

/**
 * DELETE /countries/:name
 */
router.delete("/:name", async (req, res) => {
  try {
    const country = await Country.findOne({ where: { name: req.params.name } });
    if (!country)
      return res
        .status(404)
        .json({ success: false, error: "Country not found" });

    await country.destroy();
    res.json({ success: true, message: "Country deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete country" });
  }
});

/**
 * GET /countries/image
 */
router.get("/image", (req, res) => {
  try {
    const path = "./cache/summary.png";
    if (!fs.existsSync(path))
      return res
        .status(404)
        .json({ success: false, error: "Summary image not found" });

    res.sendFile(path, { root: "." });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch summary image" });
  }
});

module.exports = router;
