const axios = require("axios");
const Country = require("../models/country");
const { createSummaryImage } = require("../utils/image");

const COUNTRIES_API =
  "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const EXCHANGE_API = "https://open.er-api.com/v6/latest/USD";

/**
 * Returns a random multiplier for GDP calculation
 */
function randomMultiplier() {
  return Math.floor(Math.random() * 1001) + 1000; // 1000-2000
}

async function refreshCountries() {
  try {
    // Fetch countries & exchange rates in parallel
    const [countryRes, exchangeRes] = await Promise.all([
      axios.get(COUNTRIES_API).catch((err) => {
        throw new Error("Countries API fetch failed: " + err.message);
      }),
      axios.get(EXCHANGE_API).catch((err) => {
        throw new Error("Exchange rates API fetch failed: " + err.message);
      }),
    ]);

    const countries = countryRes.data;
    const exchangeRates = exchangeRes.data.rates;

    // Prepare bulk upsert array
    const upsertData = countries.map((c) => {
      const currencyCode = c.currencies?.[0]?.code || null;
      const exchange_rate = currencyCode
        ? exchangeRates[currencyCode] || null
        : null;
      const estimated_gdp =
        c.population && exchange_rate
          ? (c.population * randomMultiplier()) / exchange_rate
          : 0;

      return {
        name: c.name,
        capital: c.capital || null,
        region: c.region || null,
        population: c.population || 0,
        currency_code: currencyCode || null,
        exchange_rate,
        estimated_gdp,
        flag_url: c.flag || null,
        last_refreshed_at: new Date(),
      };
    });

    // Bulk upsert (faster than looping)
    await Promise.all(upsertData.map((record) => Country.upsert(record)));

    // Create summary image
    await createSummaryImage();

    return {
      message: "Countries refreshed successfully",
      count: upsertData.length,
    };
  } catch (err) {
    console.error("Refresh error:", err.message);
    // Throw consistent error for /refresh endpoint
    throw new Error("External data source unavailable: " + err.message);
  }
}

module.exports = { refreshCountries };
