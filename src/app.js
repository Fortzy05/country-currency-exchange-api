require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./utils/db");

const countryRoutes = require("./routes/countryRoutes");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/countries", countryRoutes);

// status
app.get("/status", async (req, res) => {
  try {
    const Country = require("./models/country");
    const totalCountries = await Country.count();
    const lastRefreshed = await Country.max("last_refreshed_at");
    res.json({
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed,
    });
  } catch (err) {
    console.error("Status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// catch-all
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to sync DB:", err);
    process.exit(1);
  });
