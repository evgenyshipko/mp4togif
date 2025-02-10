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

/* Курл для проверки загрузки файла
curl -X POST http://localhost:3000/upload \
     -F "file=@/Users/e.shipko/Documents/test-1.mp4"
*/

//TODO: имплементировать очистку старых задач
/*

async function cleanupQueue() {
  await conversionQueue.clean(60 * 1000, "completed"); // Удаляет завершённые задачи через 1 минуту
  await conversionQueue.clean(60 * 1000, "failed"); // Удаляет неудачные задачи
}

setInterval(cleanupQueue, 5 * 60 * 1000); // Запуск очистки каждые 5 минут

 */


// TODO: в ридми написать, что в боевом проекте бы использовал rabbit или kafka
