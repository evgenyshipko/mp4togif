import {Response} from "express";
import {Job} from "bullmq";
import {CustomRequest} from "./middlewares/queueMiddleware";

export const uploadHandler = async (req: CustomRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: "no file uploaded" });
        return
    }
    if (!req.conversionQueue){
        res.status(500).json({ error: "no queue" });
        return
    }

    res.json({ requestId: req.id });
};

interface StatusRequestParams {
    requestId: string;
}

export const getJobStatusHandler = async (req: CustomRequest<StatusRequestParams>, res: Response) => {
    if (!req.conversionQueue){
        res.status(500).json({ error: "no queue" });
        return
    }

    const jobId = await req.redis?.get(req.params.requestId)

    if (!jobId){
        res.status(200).json({ status: "job not proceed" });
        return
    }

    const job = await Job.fromId(req.conversionQueue, jobId);
    if (!job){
        res.status(400).json({ error: "job not found" });
        return
    }

    const gifUrl = job.returnvalue?.gifUrl?.replace("minio","localhost")

    res.json({
        status: job.getState(),
        progress: job.progress,
        gifUrl,
    })
}
