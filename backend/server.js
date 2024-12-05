const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConnection');
const phedRoute = require('./routers/phedRoutes');
const authRoute = require('./routers/authRoutes');
const grampanchyatRoute = require('./routers/grampanchyatRoutes');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Database connection
connectDB();

// Middlewares
app.use(express.json());   
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});



// API Routes
app.use("/api/v1/phed", phedRoute);
app.use("/api/v1/gp", grampanchyatRoute);
app.use("/api/v1", authRoute);

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
