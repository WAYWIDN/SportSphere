import express from 'express';
import { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { morganLogger } from './utils/logger';
import authRouter from './modules/auth/routes/authRoutes';
import userProfileRouter from './modules/profile-management/routes/userProfileRoutes';
import adminRouter from './modules/admin/routes/adminRoutes';
import coachRouter from './modules/coach/routes/coachRoutes';
import sessionRequestRouter from './modules/coach/routes/sessionRequestRoutes';
import bookingRouter from './modules/booking/routes/bookingRoutes';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(morganLogger);
app.use(authRouter);
app.use(userProfileRouter);
app.use(adminRouter);
app.use(coachRouter);
app.use(sessionRequestRouter);
app.use(bookingRouter);
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

export default app;
