const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Загружаем переменные из .env

const envFilePath = path.join(__dirname, "../src/assets/env.js");

const envConfig = `
window.env = {
  API_HOST: "${process.env.API_HOST}"
};
`;

fs.writeFileSync(envFilePath, envConfig, { encoding: "utf8" });

console.log("✅ Файл env.js успешно сгенерирован!");
