// const { createCanvas } = require("canvas");
const fs = require("fs");
const Country = require("../models/country");

async function createSummaryImage() {
  const countries = await Country.findAll({
    order: [["estimated_gdp", "DESC"]],
  });
  const total = countries.length;
  const top5 = countries.slice(0, 5);

  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 800, 600);

  ctx.fillStyle = "#000";
  ctx.font = "bold 30px Arial";
  ctx.fillText(`Total Countries: ${total}`, 50, 50);

  ctx.font = "20px Arial";
  top5.forEach((c, i) => {
    ctx.fillText(
      `${i + 1}. ${c.name} - GDP: ${c.estimated_gdp.toFixed(2)}`,
      50,
      100 + i * 30
    );
  });

  ctx.fillText(`Last Refreshed: ${new Date().toISOString()}`, 50, 300);

  if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./cache/summary.png", buffer);
}

module.exports = { createSummaryImage };
