"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const discord_1 = require("@typeit/discord");
require("dotenv").config();
class Main {
    static get Client() {
        return this._client;
    }
    static start() {
        this._client = new discord_1.Client({
            variablesChar: ':',
            silent: true,
            classes: [
                `${__dirname}/*.ts`,
                `${__dirname}/*.js`,
            ]
        });
        this._client.login(process.env.TOKEN);
    }
}
exports.Main = Main;
Main.start();
//# sourceMappingURL=Main.js.map