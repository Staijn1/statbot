import * as winston from "winston";
import {format, transports} from "winston";

//These two are the same color!
export const DEFAULT_COLOR = 0xdb682e;
export const DEFAULT_COLOR_RGB = 'rgb(219,104,46)';

export const ERROR_COLOR = 0xff0000;
export const PREFIX = "&";
export const LOGGER = winston.createLogger({
    level: 'info',
    format: format.combine(format.timestamp({format: 'DD-MM-YY HH:mm:ss'}), format.json()),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new transports.Console(),
        // new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
        // new winston.transports.File({filename: 'logs/combined.log'}),
    ],
});
export const ACTIVE_USER = 100;
export const DESC = -1;
export const ASC = 1;
export const TIMEOUT = 3000;
export const DATE_FORMAT = 'dd-MM-yyyy';
// 0 0 1 * *
// at 00:00 first day of the month
export const CRON_SCHEDULE = '0 0 1 * *';

export const possibleChartColors = [
    '#FAD141',
    '#D94B21',
    '#C330F0',
    '#216FD9',
    '#26FC75',
    '#c6f839',
    '#D975D5',
    '#88C6FC',
    '#EAF59A',
    '#C73C6C'
];
