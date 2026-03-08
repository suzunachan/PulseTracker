const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// ================= DATABASE =================
const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12817927",
  password: "yNkN2DlalB",
  database: "sql12817927",
  port: 3306
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});


// ================= FILE UPLOAD =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {

      if (err) {
        console.log("Register check error:", err);
        return res.json({ success: false, message: "Database error" });
      }

      if (result.length > 0) {
        return res.json({ success: false, message: "Username already taken" });
      }

      // Insert new user
      db.query(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        [username, password],
        (err, result) => {

          if (err) {
            console.log("Register insert error:", err);
            return res.json({ success: false, message: "Database error" });
          }

          res.json({ success: true, message: "Account created successfully" });
        }
      );
    }
  );
});


// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password_hash = ?",
    [username, password],
    (err, result) => {

      if (err) {
        console.log("Login query error:", err);
        return res.json({ success: false, message: "Database error" });
      }

      if (!result || result.length === 0) {
        return res.json({ success: false, message: "Invalid login" });
      }

      res.json({ success: true, user: result[0] });
    }
  );
});

// ================= GET USER =================
app.get("/user/:id", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [req.params.id],
    (err, result) => {
      if (err || result.length === 0) return res.json({ success: false });
      res.json({ success: true, user: result[0] });
    }
  );
});

// ================= UPDATE USERNAME =================
app.put("/update-username", (req, res) => {
  const { id, newUsername } = req.body;

  db.query(
    "UPDATE users SET username=? WHERE user_id=?",
    [newUsername, id],
    () => res.json({ success: true })
  );
});


// ================= UPDATE PASSWORD =================
app.put("/update-password", (req, res) => {
  const { id, newPassword } = req.body;

  db.query(
    "UPDATE users SET password_hash=? WHERE user_id=?",
    [newPassword, id],
    () => res.json({ success: true })
  );
});


// ================= UPLOAD PROFILE PIC =================
app.post("/upload-profile-pic", upload.single("profilePic"), (req, res) => {
  const id = req.body.id;

  console.log("Upload hit — id:", id, "file:", req.file);

  if (!req.file) {
    return res.json({ success: false, message: "No file received" });
  }

  const imagePath = "/uploads/" + req.file.filename;

  db.query(
    "UPDATE users SET profilePic=? WHERE user_id=?",
    [imagePath, id],
    (err) => {
      if (err) {
        console.log("DB error:", err);
        return res.json({ success: false });
      }
      res.json({ success: true, imagePath });
    }
  );
});


// ================= SAVE METRIC =================
app.post("/add-metric", (req, res) => {
  const { userId, metricType, value1, value2, unit, notes } = req.body;

  db.query(
    `INSERT INTO metrics_data 
     (user_id, metric_type, value1, value2, unit, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, metricType, value1, value2, unit, notes],
    (err) => {
      if (err) {
        console.log("Metric insert error:", err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

// ================= GET METRICS =================
app.get("/metrics/:userId", (req, res) => {
  db.query(
    "SELECT * FROM metrics_data WHERE user_id = ? ORDER BY created_at DESC",
    [req.params.userId],
    (err, result) => {
      if (err) return res.json([]);
      res.json(result);
    }
  );
});

// ================= SAVE LIFESTYLE DATA =================
app.post("/save-lifestyle", (req, res) => {

  const { userId, metricType, value } = req.body;

  db.query(
    "INSERT INTO lifestyle_data (user_id, metric_type, value) VALUES (?, ?, ?)",
    [userId, metricType, value],
    (err) => {

      if (err) {
        console.log("Lifestyle insert error:", err);
        return res.json({ success: false });
      }

      res.json({ success: true });
    }
  );
});

// ================= GET LIFESTYLE DATA =================
app.get("/lifestyle/:userId", (req, res) => {

  const userId = req.params.userId;

  db.query(
    `
    SELECT metric_type, value
    FROM lifestyle_data
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId],
    (err, results) => {

      if (err) {
        console.log("Lifestyle fetch error:", err);
        return res.json({ success: false });
      }

      const latestMetrics = {};

      results.forEach(row => {
        if (!latestMetrics[row.metric_type]) {
          latestMetrics[row.metric_type] = row.value;
        }
      });

      res.json({ success: true, metrics: latestMetrics });
    }
  );
});

// ================= GET SLEEP DATA =================
app.get("/sleep/:userId", (req, res) => {
  db.query(
    "SELECT * FROM sleep_data WHERE user_id = ?",
    [req.params.userId],
    (err, result) => res.json(result)
  );
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("Server running on port " + PORT);
});