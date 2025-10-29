const Country = require("./models/Country");
const refreshService = require("../services/refreshService");

// POST /countries/refresh
exports.refreshCountries = async (req, res) => {
  try {
    const result = await refreshService.refreshCountries();
    res.json({ message: "Countries refreshed successfully", data: result });
  } catch (err) {
    console.error(err);
    res.status(503).json({
      error: "External data source unavailable",
      details: err.message,
    });
  }
};

// GET /countries
exports.getAllCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;

    let queryOptions = {};
    if (region) queryOptions.region = region;
    if (currency) queryOptions.currency_code = currency;

    let countries = await Country.findAll({ where: queryOptions });

    // Sorting
    if (sort === "gdp_desc") {
      countries.sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0));
    } else if (sort === "gdp_asc") {
      countries.sort((a, b) => (a.estimated_gdp || 0) - (b.estimated_gdp || 0));
    }

    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /countries/:name
exports.getCountryByName = async (req, res) => {
  try {
    const country = await Country.findOne({
      where: { name: req.params.name },
    });

    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }

    res.json(country);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /countries/:name
exports.deleteCountry = async (req, res) => {
  try {
    const deleted = await Country.destroy({
      where: { name: req.params.name },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Country not found" });
    }

    res.json({ message: "Country deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
