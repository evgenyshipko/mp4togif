import express from "express";
import {ROUTER} from "./src/router";
import {queueMiddleware} from "./src/middlewares/queueMiddleware";
import {Queue} from "bullmq";
import {BULL_CONFIG, CONVERSION_QUEUE_NAME} from "../common/bullConfig";
import {redisMiddleware} from "./src/middlewares/redisMiddleware";
import cors from "cors"
import {requestIdMiddleware} from "./src/middlewares/requestId";

const app = express()
const PORT = process.env.SERVER_PORT || 3000;

export const conversionQueue = new Queue(CONVERSION_QUEUE_NAME, { connection: BULL_CONFIG });

app.use(requestIdMiddleware)

app.use(
    cors({
        origin: 'http://localhost:4200',
    }),
);

app.use(redisMiddleware)

app.use(queueMiddleware(conversionQueue))

app.use(ROUTER)

app.listen(PORT, () => {
    console.info(`server started at http://localhost:${PORT}`);
});



