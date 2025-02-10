import {NextFunction, Request, Response} from "express";
import ffmpeg from "fluent-ffmpeg";
import stream, {PassThrough, Readable} from "stream";

const getVideoFileMetadata = (stream: stream.Readable) => new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
    ffmpeg().input(stream).ffprobe(0, (err, metadata) => {
        if (err) {
            console.error(err);
            reject("error while processing video file");
        }
        resolve(metadata);
    })
})

let count = 0


export const validateMp4 = async (req: Request, res: Response, next: NextFunction) => {
    count++

    console.log(`Запрос №${count}`)

    if (!req.file) {
        res.status(400).json({ error: "no file uploaded" });
        return
    }

    if (!req.file.originalname.endsWith(".mp4")){
        throw new Error("file has wrong format");
    }

    const validateStream = new Readable();
    validateStream.push(req.file.buffer);
    validateStream.push(null);


    const fileStream = new PassThrough();
    validateStream.pipe(fileStream)

    req.file.stream = fileStream

    try {
        const metadata = await getVideoFileMetadata(validateStream)

        const { width, height } = metadata.streams.find(s => s.codec_type === "video") || {};
        const duration = metadata.format.duration || 0;

        console.log("width",width,"height",height,"duration",duration)

        if (width && height && (width > 1024 || height > 768)) {
            throw new Error("video resolution exceeds 1024x768")
        }

        if (duration > 10) {
            throw new Error("video duration exceeds 10 seconds")
        }

        next()
    }catch(error){
        console.error(error)
        res.status(400).json({ error: (error as Error)?.message });
        return
    }
};
