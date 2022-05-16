const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./test.db", (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connection Success!");
  }
});

db.run(
  "CREATE TABLE IF NOT EXISTS quizs(id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(100) NOT NULL,desc VARCHAR(100) NOT NULL)"
);

db.run(
  "CREATE TABLE IF NOT EXISTS questions(id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(100) NOT NULL,options VARCHAR(100) NOT NULL,right_option INTEGER NOT NULL,quiz_id INTEGER NOT NULL)"
);

module.exports = db;
