import { Request, Response, NextFunction } from "express";
import { Queue } from "bullmq";
import { ParamsDictionary } from "express-serve-static-core"
import {RedisClientType} from "redis";

export interface CustomRequest<T = ParamsDictionary> extends Request<T> {
    conversionQueue?: Queue;
    id?: string
    redis?: RedisClientType
}

export const queueMiddleware = (queue: Queue) => {
    return (req: CustomRequest, _res: Response, next: NextFunction) => {
        req.conversionQueue = queue;
        next();
    };
};
