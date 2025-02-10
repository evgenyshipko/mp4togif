import {Job, Worker} from "bullmq";
import {BULL_CONFIG, CONVERSION_QUEUE_NAME} from "../common/bullConfig";
import * as path from "node:path";
import ffmpeg from "fluent-ffmpeg"
import {BUCKET, s3Client} from "../server/config";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage"
import fs from "fs-extra"

const TEMP_DIR = path.join(__dirname, "temp");
fs.ensureDirSync(TEMP_DIR);

const worker = new Worker(
    CONVERSION_QUEUE_NAME,
    async (job: Job) => {
        const videoUrl: string = job.data.videoUrl;

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

async function uploadToS3(localPath: string, s3Key: string) {
    const fileStream = fs.createReadStream(localPath);
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: BUCKET,
            Key: s3Key,
            Body: fileStream,
            ACL: "public-read",
            ContentType: "image/gif",
        },
    });

    await upload.done();

    return `${process.env.MINIO_ENDPOINT}/${BUCKET}/${s3Key}`;
}

async function downloadFromS3(videoKey: string, localPath: string) {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: videoKey });
    const { Body } = await s3Client.send(command);

    if (!Body) throw new Error("Ошибка скачивания видео из MinIO");

    const writeStream = fs.createWriteStream(localPath);
    await new Promise<void>((resolve, reject) => {
        (Body as NodeJS.ReadableStream).pipe(writeStream);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });
}

async function convertToGif(inputPath: string, outputPath: string) {
    await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .outputOptions(["-vf", "scale=-1:400", "-r 5"])
            .on("end", () => resolve())
            .on("error", reject)
            .run();
    });
}

worker.on("completed", (job) => {
    console.info(`job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`job ${job?.id} failed: ${err.message} ${err.stack}`);
});

console.info("worker started successfully");
