const axios = require("axios");

const BASE_URL = "http://localhost:5000/countries";

async function testAPI() {
  try {
    console.log("⏳ Starting API tests...\n");

    // 1️⃣ Refresh countries
    console.log("Testing POST /countries/refresh...");
    try {
      const refreshRes = await axios.post(`${BASE_URL}/refresh`);
      console.log("✅ Refresh response:", refreshRes.data);
    } catch (err) {
      console.error("❌ Refresh failed:", err.response?.data || err.message);
    }

    // 2️⃣ List all countries
    console.log("\nTesting GET /countries...");
    const listRes = await axios.get(BASE_URL);
    console.log(`✅ Retrieved ${listRes.data.length} countries`);

    // 3️⃣ Filter by region
    console.log("\nTesting GET /countries?region=Asia...");
    const asiaRes = await axios.get(`${BASE_URL}?region=Asia`);
    console.log(`✅ Asia countries: ${asiaRes.data.length}`);

    // 4️⃣ Filter by currency & sort
    console.log("\nTesting GET /countries?currency=USD&sort=gdp_desc...");
    const filterRes = await axios.get(`${BASE_URL}?currency=USD&sort=gdp_desc`);
    console.log(
      `✅ USD countries sorted by GDP: ${filterRes.data.length}`,
      filterRes.data.slice(0, 3).map((c) => c.name)
    );

    // 5️⃣ Get single country
    const sampleCountry = listRes.data[0]?.name;
    if (sampleCountry) {
      console.log(`\nTesting GET /countries/${sampleCountry}...`);
      const singleRes = await axios.get(
        `${BASE_URL}/${encodeURIComponent(sampleCountry)}`
      );
      console.log(`✅ Retrieved country:`, singleRes.data.name);
    }

    // 6️⃣ Delete a country (re-add later)
    const deleteCountry = listRes.data[1]?.name;
    if (deleteCountry) {
      console.log(`\nTesting DELETE /countries/${deleteCountry}...`);
      const delRes = await axios.delete(
        `${BASE_URL}/${encodeURIComponent(deleteCountry)}`
      );
      console.log(`✅ Delete response:`, delRes.data);

      // Optional: Re-add to keep DB intact
      console.log(`Re-adding ${deleteCountry} after deletion...`);
      await axios.post(`${BASE_URL}/refresh`);
    }

    // 7️⃣ Summary image
    console.log("\nTesting GET /countries/image...");
    try {
      const imageRes = await axios.get(`${BASE_URL}/image`, {
        responseType: "arraybuffer",
      });
      console.log(
        `✅ Summary image received, size: ${imageRes.data.byteLength} bytes`
      );
    } catch {
      console.error("❌ Summary image not found");
    }

    console.log("\n🎯 All tests finished!");
  } catch (err) {
    console.error("❌ API test failed:", err.message);
  }
}

// Run the test
testAPI();
