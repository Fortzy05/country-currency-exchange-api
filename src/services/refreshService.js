const axios = require("axios");
const sequelize = require("../utils/db");
const Country = require("../models/country");
const { createSummaryImage } = require("../utils/image");
const { fn, col } = require("sequelize");

const COUNTRIES_API_URL = process.env.COUNTRIES_API;
const EXCHANGE_RATE_API_URL = process.env.EXCHANGE_API;

// Random GDP multiplier 1000–2000
function randomMultiplier() {
  return Math.floor(Math.random() * 1001) + 1000;
}

// ✅ Retry wrapper for Axios requests
async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { timeout: 15000 });
    } catch (err) {
      const isLastAttempt = i === retries - 1;

      console.warn(`Attempt ${i + 1} failed for ${url}:`, err.message);

      if (isLastAttempt) {
        throw new Error(`Failed after ${retries} retries: ${err.message}`);
      }

      // Exponential backoff delay
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2; // 500 → 1000 → 2000
    }
  }
}

async function refreshCountries() {
  let countriesData;
  let exchangeRates;

  // 1. Fetch external APIs with retry logic
  try {
    const [countriesRes, exchangeRes] = await Promise.all([
      fetchWithRetry(COUNTRIES_API_URL, 3, 500),
      fetchWithRetry(EXCHANGE_RATE_API_URL, 3, 500),
    ]);

    countriesData = countriesRes.data;
    exchangeRates = exchangeRes.data.rates || {};
  } catch (err) {
    console.error("External API fetch error:", err.message || err);
    throw new Error("External data source unavailable");
  }

  const t = await sequelize.transaction();

  try {
    for (const c of countriesData) {
      const countryName = c?.name?.common || null;
      if (!countryName) continue;

      const capital = Array.isArray(c.capital)
        ? c.capital[0]
        : c.capital || null;

      const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : null;

      const population = c.population || 0;
      const region = c.region || null;

      const rate = currencyCode ? exchangeRates[currencyCode] : null;

      const exchange_rate = rate ?? null;
      const estimated_gdp =
        population && exchange_rate
          ? (population * randomMultiplier()) / exchange_rate
          : null;

      const flag_url = c.flags?.png || c.flags?.svg || null;

      const payload = {
        name: countryName,
        capital,
        region,
        population,
        currency_code: currencyCode,
        exchange_rate,
        estimated_gdp,
        flag_url,
        last_refreshed_at: new Date(),
      };

      const existing = await Country.findOne({
        where: sequelize.where(
          fn("lower", col("name")),
          countryName.toLowerCase()
        ),
        transaction: t,
      });

      if (existing) {
        await existing.update(payload, { transaction: t });
      } else {
        await Country.create(payload, { transaction: t });
      }
    }

    await t.commit();
    await createSummaryImage();

    return { message: "Refresh completed" };
  } catch (err) {
    await t.rollback();
    console.error("DB upsert error, rolled back:", err);
    throw new Error("Failed to update database");
  }
}

module.exports = { refreshCountries };
