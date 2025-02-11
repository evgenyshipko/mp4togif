import {NextFunction, Request, Response} from "express";
// @ts-ignore
import MP4Box from "mp4box";

export async function getMp4Params(buffer:  Buffer<ArrayBufferLike>) {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    (arrayBuffer as any).fileStart = 0;

    const mp4boxfile = MP4Box.createFile();
    return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
        mp4boxfile.onError = reject;
        mp4boxfile.onReady = (info: any) => {
            if (info.videoTracks.length === 0) {
                return reject(new Error("file does not contain videoTracks"));
            }

            const videoTrack = info.videoTracks[0];
            resolve({
                duration: info.duration / info.timescale,
                width: videoTrack.video.width,
                height: videoTrack.video.height,
            });
        };

        mp4boxfile.appendBuffer(arrayBuffer);
        mp4boxfile.flush();
    });
}

let count = 0

export const validateMp4 = async (req: Request, res: Response, next: NextFunction) => {
    count++

    console.log(`Request №${count}`)

    if (!req.file) {
        res.status(400).json({ error: "no file uploaded" });
        return
    }

    if (!req.file.originalname.endsWith(".mp4")){
        throw new Error("file has wrong format");
    }

    try {
        const {width, height, duration} = await getMp4Params(req.file.buffer)

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
