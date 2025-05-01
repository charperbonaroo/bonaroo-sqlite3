import { SqliteDatabase } from "../src";

let db: SqliteDatabase;

beforeEach(() => {
  db = new SqliteDatabase(":memory:");
})

test(".ensureMigrations & .all", () => {
  db.ensureMigrations(["CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);"]);
  const { lastInsertRowid } = db.run("INSERT INTO users (name) VALUES (?)", ["foo"]);
  expect(db.all("SELECT * FROM users")).toEqual([{ id: lastInsertRowid, name: "foo" }]);
});
