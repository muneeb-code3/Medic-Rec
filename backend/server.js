const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/doctors", (req, res) => {
  db.all("SELECT * FROM doctors ORDER BY created_at DESC", (error, doctors) => {
    if (error) {
      res.status(500).json({ error: "Failed to fetch doctors." });
      return;
    }

    res.json(doctors);
  });
});

app.post("/api/doctors", (req, res) => {
  const { name, specialty, clinic_name, phone_number, email } = req.body;

  if (!name) {
    res.status(400).json({ error: "Doctor name is required." });
    return;
  }

  const sql = `
    INSERT INTO doctors (name, specialty, clinic_name, phone_number, email)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [name, specialty, clinic_name, phone_number, email];

  db.run(sql, values, function insertDoctor(error) {
    if (error) {
      res.status(500).json({ error: "Failed to add doctor." });
      return;
    }

    res.status(201).json({
      id: this.lastID,
      name,
      specialty,
      clinic_name,
      phone_number,
      email
    });
  });
});

app.get("/api/records", (req, res) => {
  const sql = `
    SELECT
      medical_records.*,
      doctors.name AS doctor_name
    FROM medical_records
    LEFT JOIN doctors ON medical_records.doctor_id = doctors.id
    ORDER BY medical_records.record_date DESC
  `;

  db.all(sql, (error, records) => {
    if (error) {
      res.status(500).json({ error: "Failed to fetch medical records." });
      return;
    }

    res.json(records);
  });
});

app.post("/api/records", (req, res) => {
  const { doctor_id, title, category, record_date, notes } = req.body;

  if (!title || !category || !record_date) {
    res.status(400).json({
      error: "Medical record title, category, and record_date are required."
    });
    return;
  }

  const sql = `
    INSERT INTO medical_records (doctor_id, title, category, record_date, notes)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [doctor_id, title, category, record_date, notes];

  db.run(sql, values, function insertRecord(error) {
    if (error) {
      res.status(500).json({ error: "Failed to add medical record." });
      return;
    }

    res.status(201).json({
      id: this.lastID,
      doctor_id,
      title,
      category,
      record_date,
      notes
    });
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Medical records API server listening on port ${PORT}`);
  });
}

module.exports = app;
