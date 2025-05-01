"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class SqliteDatabase {
    constructor(filename) {
        this.migrationsTable = "migrations";
        this.preparedStatements = new Map();
        this.db = new better_sqlite3_1.default(filename);
        this.db.pragma('journal_mode = WAL');
    }
    /**
     * Run migrations if they're not already executed.
     */
    ensureMigrations(migrations) {
        this.exec(`CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (sql TEXT NOT NULL PRIMARY KEY)`);
        const completedMigrations = this.db.prepare(`SELECT sql FROM ${this.migrationsTable}`).all()
            .map(({ sql }) => sql);
        const appendQuery = this.db.prepare(`INSERT INTO ${this.migrationsTable} (sql) VALUES (?)`);
        for (const migration of migrations) {
            if (completedMigrations.includes(migration)) {
                continue;
            }
            try {
                this.exec(migration);
            }
            catch (error) {
                console.error(`ERROR IN QUERY:`);
                console.error(error.message);
                console.error(migration);
            }
            appendQuery.run(migration);
        }
    }
    exec(sql) {
        this.db.exec(sql);
    }
    all(sql, args = []) {
        return this.getCachedPreparedStatement(sql).all(args);
    }
    run(sql, args = []) {
        return this.getCachedPreparedStatement(sql).run(args);
    }
    get(sql, args = []) {
        return this.getCachedPreparedStatement(sql).get(args);
    }
    getCachedPreparedStatement(sql) {
        if (!this.preparedStatements.has(sql))
            this.preparedStatements.set(sql, this.db.prepare(sql));
        return this.preparedStatements.get(sql);
    }
}
exports.SqliteDatabase = SqliteDatabase;
