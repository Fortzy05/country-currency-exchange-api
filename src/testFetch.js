const axios = require("axios");

async function testFetch() {
  try {
    const countryRes = await axios.get(
      "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
    );
    console.log("Countries API OK:", countryRes.data.length, "countries");

 const res = await axios.get("https://open.er-api.com/v6/latest/USD", {
   proxy: false,
 });

    console.log(
      "Exchange API OK:",
      Object.keys(exchangeRes.data.rates).length,
      "currencies"
    );
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testFetch();
