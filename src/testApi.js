const axios = require("axios");

async function testApis() {
  try {
    const countryRes = await axios.get(
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
    );
    console.log("Countries API OK:", countryRes.data.length, "countries");

    const exchangeRes = await axios.get(
      "https://open.er-api.com/v6/latest/USD"
    );
    console.log(
      "Exchange API OK:",
      Object.keys(exchangeRes.data.rates).length,
      "currencies"
    );
  } catch (err) {
    console.error("API Error:", err.message);
  }
}

testApis();
