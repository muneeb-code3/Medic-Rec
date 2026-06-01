const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "medical_records.db");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to open database:", error.message);
    process.exit(1);
  }
});

const createDoctorsTableSql = `
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT,
    clinic_name TEXT,
    phone_number TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createDoctorsTableSql, (error) => {
  if (error) {
    console.error("Failed to create doctors table:", error.message);
    db.close();
    process.exit(1);
  }

  console.log(`Doctors table is ready in ${dbPath}`);
  db.close((closeError) => {
    if (closeError) {
      console.error("Failed to close database:", closeError.message);
      process.exit(1);
    }
  });
});
