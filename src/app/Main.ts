import {Client} from "@typeit/discord";

require("dotenv").config();

export class Main {
    private static _client: Client;

    static get Client(): Client {
        return this._client;
    }


    static start(): void {
        this._client = new Client({
            variablesChar: ':',
            silent: true,
            classes: [
                `${__dirname}/*.ts`,
                `${__dirname}/*.js`,
            ]
        });
        this._client.login(process.env.TOKEN,);
    }
}


Main.start();
