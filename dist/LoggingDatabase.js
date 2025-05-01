"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingSqliteDatabase = void 0;
const SqliteDatabase_1 = require("./SqliteDatabase");
class LoggingSqliteDatabase extends SqliteDatabase_1.SqliteDatabase {
    constructor(filename, log = console.log.bind(console)) {
        super(filename);
        this.log = log;
        this.maxArgLength = 120;
        this.maxSqlLength = 600;
    }
    exec(sql) {
        return this.measure(sql, [], () => super.exec(sql));
    }
    all(sql, args = []) {
        return this.measure(sql, args, () => super.all(sql, args));
    }
    run(sql, args = []) {
        return this.measure(sql, args, () => super.run(sql, args));
    }
    get(sql, args = []) {
        return this.measure(sql, args, () => super.get(sql, args));
    }
    measure(sql, args = [], fn) {
        const now = performance.now();
        const result = fn();
        const duration = performance.now() - now;
        let formattedSql = sql.replace(/\s+/g, " ").trim();
        if (this.maxSqlLength >= 0 && formattedSql.length > this.maxSqlLength)
            formattedSql = formattedSql.substring(0, this.maxSqlLength - 3) + "...";
        let formattedArgs = args.map((arg) => JSON.stringify(arg).substring(0, this.maxArgLength)).join(", ");
        this.log(`${duration.toFixed(2)}ms - ${formattedSql} [${formattedArgs}]`);
        return result;
    }
}
exports.LoggingSqliteDatabase = LoggingSqliteDatabase;
