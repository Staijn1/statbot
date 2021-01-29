"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const tslib_1 = require("tslib");
const Datastore = require("nedb-promises");
const path_1 = tslib_1.__importDefault(require("path"));
class DatabaseService {
    constructor(fileUrl) {
        this.baseUrl = path_1.default.join(__dirname, '..', '..', '/assets/data/');
        this.conn = Datastore.create({
            filename: path_1.default.join(this.baseUrl, fileUrl),
            autoload: true
        });
        this.conn.persistence.setAutocompactionInterval(30000);
    }
    insert(param) {
        this.conn.insert(param);
    }
    update(query, update, options = {}, callback = undefined) {
        this.conn.update(query, update, options, callback);
        this.conn.persistence.compactDatafile();
    }
    remove(query, options = {}) {
        this.conn.remove(query, options);
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map