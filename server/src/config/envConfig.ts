import dotenv from "dotenv";
dotenv.config();

const envConfig = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI!,
    REDIS_URI: process.env.REDIS_URI!,
    EMAIL_USER: process.env.EMAIL_USER!,
    EMAIL_PASS: process.env.EMAIL_PASS!,
    JWT_SECRET: process.env.JWT_SECRET!,
};

export default envConfig;