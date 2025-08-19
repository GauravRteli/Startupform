const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();
const createStartupRoutes = require("./routes/startup");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const dbConnection = mysql.createPool(dbConfig);

// Routes
app.use("/api/startup", createStartupRoutes(dbConnection));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
