const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConnection');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Database connection
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// API Routes
// app.use("/v1/api/phed", require('./routers/phed'));
// app.use("/v1/api/grampanchayat", require('./routers/gramPanchyat'));
// app.use("/v1/api/user", require('./routers/user.js'));

// Test Route
app.get("/", (req, res) => {
  res.send("Hey, this is a test");
});

// Generic error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port} 🔥`);
});
