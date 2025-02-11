import {NextFunction, Response} from "express";
import {getRedisClient} from "../../../common/redisClient";
import {CustomRequest} from "./queueMiddleware";

export const redisMiddleware = async (req: CustomRequest, _res: Response, next: NextFunction) => {
        req.redis = await getRedisClient();
        next();
};
