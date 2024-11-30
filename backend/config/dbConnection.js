// dbConnection.js
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

dotenv.config();
console.log('process.env.DATABASE_URL: ', process.env.DATABASE_URL);

const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in the environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
  }
};
module.exports = connectDB;
