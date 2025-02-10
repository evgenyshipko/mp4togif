import dotenv from "dotenv";
import {S3Client} from "@aws-sdk/client-s3";

dotenv.config();

export const BUCKET = process.env.MINIO_BUCKET || "default-bucket";

export const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: process.env.MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
});

// TODO: что-то делать с папкой data