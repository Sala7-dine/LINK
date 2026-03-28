import 'dotenv/config';
import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[LINK API] Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
