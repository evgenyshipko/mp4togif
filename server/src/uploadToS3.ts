import {BUCKET, s3Client} from "../../common/s3Client";
import {Upload} from "@aws-sdk/lib-storage"
import stream from "stream";

export async function uploadToS3(stream: stream.Readable, s3Key: string, mimeType: string) {
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: BUCKET,
            Key: s3Key,
            Body: stream,
            ACL: "public-read",
            ContentType: mimeType,
        },
    });

    await upload.done();

    return `${process.env.MINIO_ENDPOINT}/${BUCKET}/${s3Key}`;
}