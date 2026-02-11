require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[LINK API] Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
