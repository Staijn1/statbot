"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.possibleChartColors = exports.CRON_SCHEDULE = exports.DATE_FORMAT = exports.TIMEOUT = exports.ASC = exports.DESC = exports.ACTIVE_USER = exports.LOGGER = exports.PREFIX = exports.ERROR_COLOR = exports.DEFAULT_COLOR_HEX = exports.DEFAULT_COLOR = void 0;
const tslib_1 = require("tslib");
const winston = tslib_1.__importStar(require("winston"));
const winston_1 = require("winston");
//These two are the same color!
exports.DEFAULT_COLOR = 0xdb682e;
exports.DEFAULT_COLOR_HEX = '#db682e';
exports.ERROR_COLOR = 0xff0000;
exports.PREFIX = "&";
exports.LOGGER = winston.createLogger({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'DD-MM-YY HH:mm:ss' }), winston_1.format.json()),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston_1.transports.Console(),
    ],
});
exports.ACTIVE_USER = 100;
exports.DESC = -1;
exports.ASC = 1;
exports.TIMEOUT = 3000;
exports.DATE_FORMAT = 'dd-MM-yyyy';
// 0 0 1 * *
// at 00:00 first day of the month
exports.CRON_SCHEDULE = '0 0 1 * *';
// export const CRON_SCHEDULE = '* * * * *'
exports.possibleChartColors = [
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
//# sourceMappingURL=constants.js.map