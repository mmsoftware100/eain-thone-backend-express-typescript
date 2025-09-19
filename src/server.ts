import app from './app';
import config from './config/config';
import connectDB from './config/database';

// Connect to database
connectDB();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});