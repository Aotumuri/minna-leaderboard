import Database from "better-sqlite3";

export function initDB(path, config) {
    console.log("init db:", path);
    const dbConfig = config.database;
    const db = new Database(path);

    db.exec(`DROP TABLE IF EXISTS leaderboard;`);
    
    // FIXME: SQL injection 可能
    var defs = [];
    for(const i of dbConfig)
    {
        defs.push(`${i.field} ${i.type} NOT NULL`)
    }
    db.exec(`CREATE TABLE leaderboard (${defs.join(', ')})`);
}
