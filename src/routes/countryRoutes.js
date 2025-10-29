const express = require("express");
const router = express.Router();
const fs = require("fs");

const Country = require("../models/country");
const { refreshCountries } = require("../services/refreshService");

/**
 * POST /countries/refresh
 * Refresh countries from external APIs and update database
 */
router.post("/refresh", async (req, res) => {
  try {
    const result = await refreshCountries();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(503).json({
      success: false,
      error: "Failed to refresh countries. External data source unavailable.",
    });
  }
});

/**
 * GET /countries
 * List countries with optional filters and sorting
 * Query params:
 *   - region (string)
 *   - currency (string)
 *   - sort: gdp_asc | gdp_desc
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
    console.error("Fetch countries error:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch countries" });
  }
});

/**
 * GET /countries/:name
 * Fetch a single country by name
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
    console.error("Fetch country error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch country" });
  }
});

/**
 * DELETE /countries/:name
 * Delete a country by name
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
    console.error("Delete country error:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete country" });
  }
});

/**
 * GET /countries/image
 * Serve the summary image generated after refresh
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
    console.error("Image fetch error:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch summary image" });
  }
});

module.exports = router;
