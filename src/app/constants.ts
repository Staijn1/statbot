import * as winston from "winston";
import {format, transports} from "winston";

export const DEFAULT_COLOR = 0xdb682e;
export const ERROR_COLOR = 0xff0000;
export const PREFIX = "&";
export const LOGGER = winston.createLogger({
    level: 'info',
    format: format.combine(format.timestamp({format:'DD-MM-YY HH:mm:ss'}), format.json()),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new transports.Console(),
        new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
        new winston.transports.File({filename: 'logs/combined.log'}),
    ],
});
