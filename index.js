const express = require('express');
const cors = require('cors');
const router = require('./router');
require('dotenv').config();
require('./connection');

const SIM = express();
SIM.use(cors());
SIM.use(express.json());
SIM.use("/uploads", express.static("uploads"));
// ✅ Prefix all user routes with /user
SIM.use('/', router);

SIM.get('/', (req, res) => {
  res.send('Server running successfully');
});

const PORT = process.env.PORT || 4000;
SIM.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
