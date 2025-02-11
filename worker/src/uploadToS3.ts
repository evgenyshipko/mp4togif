import fs from "fs-extra";
import {BUCKET, s3Client} from "../../common/s3Client";
import {Upload} from "@aws-sdk/lib-storage"


export async function uploadToS3(localPath: string, s3Key: string) {
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