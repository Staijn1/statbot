import * as winston from "winston";
import {format, transports} from "winston";
import {MessageEmbed} from "discord.js";

export const DEFAULT_COLOR = 0xdb682e;
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
export const CREATE_ERROR_EMBED = (title, message) => {
    return new MessageEmbed().setTitle(title).setDescription(message).setColor(ERROR_COLOR)
}
export const CREATE_DEFAULT_EMBED = (title, message) => {
    return new MessageEmbed().setTitle(title).setDescription(message).setColor(DEFAULT_COLOR)
}
export const ACTIVE_USER = 100;
export const constrain = (num: number, min: number, max: number): number => {
    const MIN = min || 1;
    const MAX = max || 20;
    return Math.min(Math.max(num, MIN), MAX)
}
