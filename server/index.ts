import express from "express";
import {ROUTER} from "./router";
import {queueMiddleware} from "./middlewares/queueMiddleware";
import {Queue} from "bullmq";
import {BULL_CONFIG, CONVERSION_QUEUE_NAME} from "../common/bullConfig";

const app = express()
const PORT = process.env.SERVER_PORT || 3000;

export const conversionQueue = new Queue(CONVERSION_QUEUE_NAME, { connection: BULL_CONFIG });

app.use(queueMiddleware(conversionQueue))

app.use(ROUTER)

app.listen(PORT, () => {
    console.info(`server started at http://localhost:${PORT}`);
});



