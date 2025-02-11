import {Job, Worker} from "bullmq";
import {BULL_CONFIG, CONVERSION_QUEUE_NAME} from "../common/bullConfig";
import * as path from "node:path";
import {BUCKET} from "../common/s3Client";
import fs from "fs-extra"
import {getRedisClient} from "../common/redisClient";
import {uploadToS3} from "./src/uploadToS3";
import {downloadFromS3} from "./src/downloadFromS3";
import {convertToGif} from "./src/convertToGif";

const TEMP_DIR = path.join(__dirname, "temp");
fs.ensureDirSync(TEMP_DIR);

type ConversionQueueData = {
    videoUrl: string,
    requestId: string
}

const worker = new Worker(
    CONVERSION_QUEUE_NAME,
    async (job: Job<ConversionQueueData>) => {
        const videoUrl = job.data.videoUrl;
        const requestId = job.data.requestId;

        getRedisClient().then(client => client.set(requestId, job.id as string))

        const videoKey = videoUrl.replace(`${process.env.MINIO_ENDPOINT}/${BUCKET}/`, "");
        const videoName = path.basename(videoKey);
        const localVideoPath = path.join(TEMP_DIR, videoName);
        const gifPath = localVideoPath.replace(".mp4", ".gif");
        try{
            console.log(`Processing job ${job.id}: ${videoUrl}`);

            await downloadFromS3(videoKey, localVideoPath);

            await convertToGif(localVideoPath, gifPath);

            console.log(`Conversion complete: ${gifPath}`);

            const gifKey = `gifs/${path.basename(gifPath)}`;
            const gifUrl = await uploadToS3(gifPath, gifKey);

            console.log(`GIF uploaded: ${gifUrl}`);

            return { gifUrl };
        }finally {
            fs.removeSync(localVideoPath);
            fs.removeSync(gifPath);
        }
    },
    { connection: BULL_CONFIG }
);

worker.on("completed", (job) => {
    console.info(`job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`job ${job?.id} failed: ${err.message} ${err.stack}`);
});

console.info("worker started successfully");

