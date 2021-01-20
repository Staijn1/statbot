import Datastore = require("nedb-promises");

export abstract class DatabaseService {
    protected conn;
    private readonly baseUrl = './build/assets/data/'

    protected constructor(fileUrl: string) {
        this.conn = Datastore.create({
            filename: this.baseUrl + fileUrl,
            autoload: true
        });
        this.conn.persistence.setAutocompactionInterval(30000);
    }

    insert(param: unknown): void {
        this.conn.insert(param);
    }

    update(query: unknown, update: unknown, options = {}, callback = undefined): void {
        this.conn.update(query, update, options, callback);
    }

    remove(query:unknown, options = {}): void {
        this.conn.remove(query, options);
    }

    abstract find(options: unknown);

    abstract findOne(options: unknown);


}
