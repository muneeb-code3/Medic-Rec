const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "medical_records.db");
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to connect to database:", error.message);
  }
});

db.run("PRAGMA foreign_keys = ON");

module.exports = db;
