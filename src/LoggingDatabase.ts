import { SqliteDatabase } from "./SqliteDatabase";

export class LoggingSqliteDatabase extends SqliteDatabase {
  maxArgLength = 120;
  maxSqlLength = 600;

  constructor(
    filename: string,
    private log: (msg: string) => void = console.log.bind(console)
  ) {
    super(filename);
  }

  exec(sql: string) {
    return this.measure(sql, [], () => super.exec(sql));
  }

  all(sql: string, args: unknown[] = []) {
    return this.measure(sql, args, () => super.all(sql, args));
  }

  run(sql: string, args: unknown[] = []) {
    return this.measure(sql, args, () => super.run(sql, args));
  }

  get(sql: string, args: unknown[] = []) {
    return this.measure(sql, args, () => super.get(sql, args));
  }

  measure<T>(sql: string, args: unknown[] = [], fn: () => T) {
    const now = performance.now();
    const result = fn();
    const duration = performance.now() - now;

    let formattedSql = sql.replace(/\s+/g, " ").trim();
    if (this.maxSqlLength >= 0 && formattedSql.length > this.maxSqlLength)
      formattedSql = formattedSql.substring(0, this.maxSqlLength - 3) + "...";

    let formattedArgs = args.map((arg) => JSON.stringify(arg).substring(0, this.maxArgLength)).join(", ")

    this.log(`${duration.toFixed(2)}ms - ${formattedSql} [${formattedArgs}]`);
    return result;
  }
}
