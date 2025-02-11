import ffmpeg from "fluent-ffmpeg";

export async function convertToGif(inputPath: string, outputPath: string) {
    await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .outputOptions(["-vf", "scale=-1:400", "-r 5"])
            .on("end", () => resolve())
            .on("error", reject)
            .run();
    });
}