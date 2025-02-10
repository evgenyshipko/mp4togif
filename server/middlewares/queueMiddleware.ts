import { Request, Response, NextFunction } from "express";
import { Queue } from "bullmq";
import { ParamsDictionary } from "express-serve-static-core"

export interface CustomRequest<T = ParamsDictionary> extends Request<T> {
    conversionQueue?: Queue;
}

export const queueMiddleware = (queue: Queue) => {
    return (req: CustomRequest, _res: Response, next: NextFunction) => {
        req.conversionQueue = queue;
        next();
    };
};
