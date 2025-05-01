# bonaroo-sqlite3

```ts
import { SqliteDatabase } from "bonaroo-sqlite3"

const db = new SqliteDatabase(":memory:");
db.ensureMigrations([
  "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);"
]);
const { lastInsertRowid } = db.run(
  "INSERT INTO users (name) VALUES (?)", ["foo"]);
expect(db.all("SELECT * FROM users"))
  .toEqual([{ id: lastInsertRowid, name: "foo" }]);
```

Sqlite3 made even simpler. Relies on [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3), will use `node:sqlite` in the future.

## Publish

Don't forget to increment the version

```sh
npm whoami # bonaroo
npm publish --dry-run
npm publish
```
