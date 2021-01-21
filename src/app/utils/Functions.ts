import {LOGGER} from "./constants";

/**
 * Filter out the <@! and > in the strings, leaving only numbers (userid). Join them from one array into a string
 * @param garbledUserId - The garbled userid to format
 */
export function getUserId(garbledUserId: string): string {
    try {
        return garbledUserId.match(/\d/g).join("");
    } catch (e) {
        LOGGER.error(`${e.message} || ${e.stack}`)
        return undefined;
    }
}
