import app from './app';
import envConfig from './config/envConfig';
import { connectDB } from './config/mongoConfig';
import { redisClient } from './config/redisConfig';
import { startOTPEmailWorker } from './workers/otpEmailWorker';
import { startBookingNotificationWorker } from './workers/bookingNotificationWorker';
import { startGameNotificationWorker } from './workers/gameNotificationWorker';

const PORT = envConfig.PORT;

async function startServer() {
  await connectDB();
  await redisClient.connect();
  startBookingNotificationWorker();
  startGameNotificationWorker();
  startOTPEmailWorker();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} ✅`);
  });
}

startServer();
