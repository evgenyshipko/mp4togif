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

    res.json({ status: "ok" });
};

interface StatusRequestParams {
    jobId: string;
}

export const getJobStatusHandler = async (req: CustomRequest<StatusRequestParams>, res: Response) => {
    if (!req.conversionQueue){
        res.status(500).json({ error: "no queue" });
        return
    }

    const job = await Job.fromId(req.conversionQueue, req.params.jobId);
    if (!job){
        res.status(400).json({ status: "job not found" });
        return
    }

    res.json({
        status: job.getState(),
        progress: job.progress,
        result: job.returnvalue,
    })
}
