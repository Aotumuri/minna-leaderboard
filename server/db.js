import Database from "better-sqlite3";

let db;

export function initDB(path, config) {
  console.log("init db:", path);
  const dbConfig = config.database;
  db = new Database(path);

  db.exec(`DROP TABLE IF EXISTS leaderboard;`);

  // FIXME: SQL injection 可能
  var defs = [];
  for (const i of dbConfig) {
    defs.push(`${i.field} ${i.type} NOT NULL`);
  }
  db.exec(`CREATE TABLE leaderboard (${defs.join(", ")})`);
}

export function setDB(path) {
  db = new Database(path);
}

export function getLeaderBoard(field, sort, limit) {
  return db
    .prepare(
      `SELECT ${field.join(", ")} FROM leaderboard ORDER BY ${sort.key} ${sort.type} ${limit ? `LIMIT ${limit}` : ""}`,
    )
    .all();
}

export function resetLeaderBoard() {
  db.exec(`DELETE FROM leaderboard`);
}

// TODO: デバック用にデータを追加する
export function setDecoy() {
  const setData = db.prepare(
    `INSERT INTO leaderboard (name, kill, time, score) VALUES (?, ?, ?, ?);`,
  );
  setData.run("choco1", "2", "1.2", "3.2");
  setData.run("choco2", "1", "1.4", "3.5");
  setData.run("choco3", "3", "1.6", "3.8");
  setData.run("choco4", "4", "1.4", "3.3");
  setData.run("choco5", "5", "1.7", "3.7");
  return getLeaderBoard(["name", "kill", "time", "score"], {
    key: "score",
    type: "ASC",
  });
}
