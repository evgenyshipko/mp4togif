import {Router as ExpressRouter} from 'express';
import {getJobStatusHandler, uploadHandler} from "./handlers";
import {validateMp4} from "./middlewares/validateMp4";
import {uploadToStorage} from "./middlewares/uploadToStorage";
import {saveFileInRAM} from "./middlewares/saveFileInRAM";

class Router {
    router = ExpressRouter();

    constructor() {
        this.init();
    }

    init() {
        this.router.post("/upload", saveFileInRAM, validateMp4, uploadToStorage, uploadHandler);

        this.router.get("/status/:requestId", getJobStatusHandler);
    }
}

export const ROUTER = new Router().router;