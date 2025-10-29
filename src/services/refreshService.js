const axios = require("axios");
const Country = require("../models/country");
const { createSummaryImage } = require("../utils/image");

const COUNTRIES_API =
  "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const EXCHANGE_API = "https://open.er-api.com/v6/latest/USD";

function randomMultiplier() {
  return Math.floor(Math.random() * 1001) + 1000; // 1000–2000
}

async function refreshCountries() {
  try {
    // Fetch APIs individually with error handling
    let countries, exchangeRates;

    try {
      const countryRes = await axios.get(COUNTRIES_API, { timeout: 10000 });
      countries = countryRes.data;
    } catch {
      throw new Error("Could not fetch countries API");
    }

    try {
      const exchangeRes = await axios.get(EXCHANGE_API, { timeout: 10000 });
      exchangeRates = exchangeRes.data.rates;
    } catch {
      throw new Error("Could not fetch exchange rates API");
    }

    // Prepare bulk upsert data
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
        currency_code: currencyCode,
        exchange_rate,
        estimated_gdp,
        flag_url: c.flag || null,
        last_refreshed_at: new Date(),
      };
    });

    // Bulk upsert
    await Promise.all(upsertData.map((record) => Country.upsert(record)));

    // Generate summary image
    await createSummaryImage();

    return {
      message: "Countries refreshed successfully",
      count: upsertData.length,
    };
  } catch (err) {
    console.error("RefreshCountries error:", err.message);
    throw new Error("External API failed");
  }
}

module.exports = { refreshCountries };
