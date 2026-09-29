import express from 'express';
import { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { morganLogger } from './utils/logger';
import authRouter from './modules/auth/routes/authRoutes';
import userProfileRouter from './modules/profile-management/routes/userProfileRoutes';
import adminRouter from './modules/admin/routes/adminRoutes';
import coachRouter from './modules/coach/routes/coachRoutes';
import coachSessionRequestRouter from './modules/coach/routes/coachSessionRequestRoutes';
import bookingRouter from './modules/booking/routes/bookingRoutes';
import venueOwnerRouter from './modules/venue-owner/routes/venueOwnerRoutes';
import venueOwnerSessionRequestRouter from './modules/venue-owner/routes/venueOwnerSessionRequestRouter';
import gameRouter from './modules/game/routes/gameRoutes';
import { getUploadSignature } from './service/imageUploadService';
import { authMiddleware } from './middleware/authMiddleWare';
import envConfig from './config/envConfig';

const app = express();

app.use(
  cors({
    origin: envConfig.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(morganLogger);

const apiRouter = express.Router();

apiRouter.use(authRouter);
apiRouter.use(userProfileRouter);
apiRouter.use(adminRouter);
apiRouter.use(coachRouter);
apiRouter.use(coachSessionRequestRouter);
apiRouter.use(bookingRouter);
apiRouter.use(venueOwnerRouter);
apiRouter.use(venueOwnerSessionRequestRouter);
apiRouter.use(gameRouter);

apiRouter.post('/v1/upload/signed-url', authMiddleware, getUploadSignature);

apiRouter.get('/v1/check-kar', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
  });
});

app.use('/api', apiRouter);

export default app;
