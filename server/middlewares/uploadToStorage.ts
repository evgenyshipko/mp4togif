import {NextFunction, Response} from "express";
import {uploadToS3} from "../uploadToS3";
import {CustomRequest} from "./queueMiddleware";


export const uploadToStorage = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
        res.status(400).json({ error: "File path is missing" });
        return;
    }

    try {
        const cloudFileName = `uploads/${Date.now()}-${req.file.originalname}`

        const fileStream = req.file.stream

        uploadToS3(fileStream, cloudFileName, "video/mp4").then(url => {
            console.info(`file uploaded to: ${url}`)

            req.conversionQueue?.add("convert", { videoUrl: url }).catch((err: Error) => {
                console.error("ERROR WHEN ADDING TO QUEUE: ", err)
            });
            // TODO: связыывавть jobID и RequestId где-то (РЕДИС)

            //FIXME: workerы разбирают не все джобы из булла
        })

        next();
    } catch (error) {
        console.error("error uploading file to cloud:", error);
        res.status(500).json({ error: "failed to upload file to cloud" });
    }
};