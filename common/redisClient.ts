import {createClient, RedisClientType} from "redis";
import {BULL_CONFIG} from "./bullConfig";

let REDIS_CLIENT: RedisClientType

const initRedisClient = async () => {
    await createClient({
        url: `redis://${BULL_CONFIG.host}:${BULL_CONFIG.port}`,
    })
        .on('error', err => console.log('Redis Client Error', err))
        .connect().then(redisClient => {REDIS_CLIENT = redisClient as RedisClientType;})
}

export const getRedisClient = async () => {
    if (!REDIS_CLIENT){
        await initRedisClient()
    }
    return REDIS_CLIENT
}