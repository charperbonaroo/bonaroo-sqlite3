import Sqlite3 from "better-sqlite3";

export class SqliteDatabase {
  private migrationsTable = "migrations"
  private db: Sqlite3.Database;
  private preparedStatements = new Map<string, Sqlite3.Statement>();

  constructor(filename: string) {
    this.db = new Sqlite3(filename);
    this.db.pragma('journal_mode = WAL');
  }

  /**
   * Run migrations if they're not already executed.
   */
  ensureMigrations(migrations: string[]) {
    this.exec(`CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (sql TEXT NOT NULL PRIMARY KEY)`);
    const completedMigrations = this.db.prepare(`SELECT sql FROM ${this.migrationsTable}`).all()
      .map(({ sql }: any) => sql as string);
    const appendQuery = this.db.prepare(`INSERT INTO ${this.migrationsTable} (sql) VALUES (?)`);

    for (const migration of migrations) {
      if (completedMigrations.includes(migration)) {
        continue;
      }
      try {
        this.exec(migration);
      } catch (error) {
        console.error(`ERROR IN QUERY:`);
        console.error((error as Error).message);
        console.error(migration);
      }
      appendQuery.run(migration);
    }
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  all(sql: string, args: unknown[] = []): unknown[] {
    return this.getCachedPreparedStatement(sql).all(args);
  }

  run(sql: string, args: unknown[] = []): SqliteDatabase.RunResult {
    return this.getCachedPreparedStatement(sql).run(args);
  }

  get(sql: string, args: unknown[] = []): unknown {
    return this.getCachedPreparedStatement(sql).get(args);
  }

  private getCachedPreparedStatement(sql: string): Sqlite3.Statement {
    if (!this.preparedStatements.has(sql))
      this.preparedStatements.set(sql, this.db.prepare(sql));
    return this.preparedStatements.get(sql)!;
  }
}

export namespace SqliteDatabase {
  export type PreparedStatement = Sqlite3.Statement;
  export type RunResult = Sqlite3.RunResult;
}
