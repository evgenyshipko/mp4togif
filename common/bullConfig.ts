
export const BULL_CONFIG = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
};

export const CONVERSION_QUEUE_NAME = "mp4-to-gif"