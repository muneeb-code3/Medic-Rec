const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
// Serve uploaded attachments statically under /attachments
app.use("/attachments", express.static(path.join(__dirname, "..", "attachments_storage")));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "attachments_storage"),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}_${sanitized}`);
  },
});
const upload = multer({ storage });

// ---------- Doctor routes ----------
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
  db.run(sql, values, function (error) {
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
      email,
    });
  });
});

// ---------- Record routes ----------
app.get("/api/records", (req, res) => {
  const { search, category, doctor_id, start_date, end_date } = req.query;
  // Base query
  let sql = `
    SELECT
      medical_records.*,
      doctors.name AS doctor_name
    FROM medical_records
    LEFT JOIN doctors ON medical_records.doctor_id = doctors.id`;
  const conditions = [];
  const params = [];

  if (search) {
    const term = `%${search.toLowerCase()}%`;
    conditions.push(`(LOWER(medical_records.title) LIKE ? OR LOWER(medical_records.notes) LIKE ?)`);
    params.push(term, term);
  }
  if (category) {
    conditions.push(`medical_records.category = ?`);
    params.push(category);
  }
  if (doctor_id) {
    conditions.push(`medical_records.doctor_id = ?`);
    params.push(doctor_id);
  }
  if (start_date) {
    conditions.push(`medical_records.record_date >= ?`);
    params.push(start_date);
  }
  if (end_date) {
    conditions.push(`medical_records.record_date <= ?`);
    params.push(end_date);
  }

  if (conditions.length) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY medical_records.record_date DESC";

  db.all(sql, params, (error, records) => {
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
    res.status(400).json({ error: "Medical record title, category, and record_date are required." });
    return;
  }
  const sql = `
    INSERT INTO medical_records (doctor_id, title, category, record_date, notes)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [doctor_id, title, category, record_date, notes];
  db.run(sql, values, function (error) {
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
      notes,
    });
  });
});

// ---------- Attachment route ----------
app.post('/api/records/:id/attachments', upload.single('attachment'), (req, res) => {
  const recordId = Number(req.params.id);
  if (!recordId) {
    return res.status(400).json({ error: 'Invalid record id' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const { filename, path: filePath, mimetype } = req.file;
  const sql = `INSERT INTO attachments (record_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)`;
  const values = [recordId, filename, filePath, mimetype];
  db.run(sql, values, function (error) {
    if (error) {
      console.error('Failed to insert attachment:', error.message);
      return res.status(500).json({ error: 'Failed to save attachment' });
    }
    res.status(201).json({
      id: this.lastID,
      record_id: recordId,
      file_name: filename,
      file_path: filePath,
      file_type: mimetype,
    });
  });
});

// ---------- Server start ----------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Medical records API server listening on port ${PORT}`);
  });
}

module.exports = app;
