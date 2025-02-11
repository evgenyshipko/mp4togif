import {GetObjectCommand} from "@aws-sdk/client-s3";
import {BUCKET, s3Client} from "../../common/s3Client";
import fs from "fs-extra";

export async function downloadFromS3(videoKey: string, localPath: string) {
    const command = new GetObjectCommand({Bucket: BUCKET, Key: videoKey});
    const {Body} = await s3Client.send(command);

    if (!Body) throw new Error("error downloading from S3");

    const writeStream = fs.createWriteStream(localPath);
    await new Promise<void>((resolve, reject) => {
        (Body as NodeJS.ReadableStream).pipe(writeStream);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });
}