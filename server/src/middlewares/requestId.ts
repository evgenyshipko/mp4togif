import {NextFunction, Response} from "express";
import {CustomRequest} from "./queueMiddleware";
import {v4 as uuid} from "uuid";

export const requestIdMiddleware = (req: CustomRequest, _res: Response, next: NextFunction) => {
        req.id = uuid();
        next();
    };

