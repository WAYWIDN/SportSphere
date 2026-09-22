import app from "./app";
import dotenv from "dotenv";
dotenv.config();
import {connectDB} from "./config/mongoConfig";
import { redisClient} from "./config/redisConfig";

const PORT = process.env.PORT || 5000;

async function startServer() {

    await connectDB();
    await redisClient.connect();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} ✅`);
    });

}

startServer();
