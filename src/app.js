const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./utils/db");
require("dotenv").config();

const countryRoutes = require("./routes/countryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/countries", countryRoutes);

// Health / status route
app.get("/status", async (req, res) => {
  try {
    const Country = require("./models/country");
    const totalCountries = await Country.count();
    const lastRefreshed = await Country.max("last_refreshed_at");
    res.json({
      success: true,
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed,
    });
  } catch (err) {
    console.error("Status check error:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve status" });
  }
});

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// Sync DB and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database synced!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to sync DB:", err.message);
  });
