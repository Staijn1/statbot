import Datastore = require("nedb-promises");
import path from "path";

export abstract class DatabaseService {
    protected conn;
    private readonly baseUrl = path.join(__dirname, '..', '..', '/assets/data/')

    protected constructor(fileUrl: string) {
        this.conn = Datastore.create({
            filename: path.join(this.baseUrl, fileUrl),
            autoload: true
        });
        this.conn.persistence.setAutocompactionInterval(30000);
    }

    insert(param: unknown): void {
        this.conn.insert(param);
    }

    update(query: unknown, update: unknown, options = {}, callback = undefined): void {
        this.conn.update(query, update, options, callback);
        this.conn.persistence.compactDatafile();
    }

    remove(query: unknown, options = {}): void {
        this.conn.remove(query, options);
    }

    abstract findAll(options: unknown):unknown;

    abstract findOne(options: unknown):unknown;
}
