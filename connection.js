const mongoose = require('mongoose');
require('dotenv').config(); // ✅ Load .env variables

const connectionString = process.env.DATABASE;

mongoose
  .connect(connectionString)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
