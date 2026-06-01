const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "medical_records.db");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to open database:", error.message);
    process.exit(1);
  }
});

const schemaStatements = [
  "PRAGMA foreign_keys = ON",
  `
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      clinic_name TEXT,
      phone_number TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      record_date DATE NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      start_date DATE,
      end_date DATE,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE SET NULL
    )
  `,
  "CREATE INDEX IF NOT EXISTS idx_medical_records_record_date ON medical_records(record_date)",
  "CREATE INDEX IF NOT EXISTS idx_medical_records_category ON medical_records(category)"
];

const runStatement = (statement) =>
  new Promise((resolve, reject) => {
    db.run(statement, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const closeDatabase = () =>
  new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const initializeDatabase = async () => {
  try {
    for (const statement of schemaStatements) {
      await runStatement(statement);
    }

    await closeDatabase();
    console.log(`Medical records schema is ready in ${dbPath}`);
  } catch (error) {
    console.error("Failed to initialize database schema:", error.message);
    db.close();
    process.exit(1);
  }
};

initializeDatabase();
