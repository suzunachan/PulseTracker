const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ================= SUPABASE =================
const SUPABASE_URL = "https://misvuvddshojtqxokbsc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3Z1dmRkc2hvanRxeG9rYnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDc2NDMsImV4cCI6MjA4ODg4MzY0M30.v7Sgd-nmE8lRjKaBpcvJUpnusrskVbWzFC2TSqZVyR4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Use memory storage — no local disk, upload straight to Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });


// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { username, password, first_name, middle_name, last_name, role } = req.body;

  const finalRole = role || "student";
  console.log("REGISTER — username:", username, "| role:", finalRole);

  const { data: existing } = await supabase
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();

  if (existing) {
    return res.json({ success: false, message: "Username already taken" });
  }

  // Insert role in the same operation — no separate update needed
  const { error } = await supabase
    .from("users")
    .insert([{
      username,
      password_hash: password,
      first_name,
      middle_name: middle_name || null,
      last_name,
      role: finalRole,
    }]);

  if (error) {
    console.log("Register error:", error);
    return res.json({ success: false, message: "Database error" });
  }

  console.log("Registered successfully as:", finalRole);
  res.json({ success: true, message: "Account created successfully" });
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password_hash", password)
    .single();

  if (error || !data) {
    return res.json({ success: false, message: "Invalid login" });
  }

  res.json({ success: true, user: data });
});


// ================= GET USER =================
app.get("/user/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", req.params.id)
    .single();

  if (error || !data) return res.json({ success: false });
  res.json({ success: true, user: data });
});


// ================= UPDATE ROLE =================
app.put("/update-role", async (req, res) => {
  const { id, role } = req.body;
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("user_id", id);
  if (error) return res.json({ success: false });
  res.json({ success: true });
});


// ================= UPDATE USERNAME =================
app.put("/update-username", async (req, res) => {
  const { id, newUsername } = req.body;

  const { data: existing } = await supabase
    .from("users")
    .select("user_id")
    .eq("username", newUsername)
    .single();

  if (existing) {
    return res.json({ success: false, message: "Username already taken" });
  }

  const { error } = await supabase
    .from("users")
    .update({ username: newUsername })
    .eq("user_id", id);

  if (error) return res.json({ success: false });
  res.json({ success: true });
});


// ================= UPDATE FULL NAME =================
app.put("/update-name", async (req, res) => {
  const { id, first_name, middle_name, last_name } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ first_name, middle_name, last_name })
    .eq("user_id", id);

  if (error) return res.json({ success: false });
  res.json({ success: true });
});


// ================= UPDATE PASSWORD =================
app.put("/update-password", async (req, res) => {
  const { id, newPassword } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ password_hash: newPassword })
    .eq("user_id", id);

  if (error) return res.json({ success: false });
  res.json({ success: true });
});


// ================= UPLOAD PROFILE PIC =================
app.post("/upload-profile-pic", upload.single("profilePic"), async (req, res) => {
  const id = req.body.id;

  if (!req.file) {
    return res.json({ success: false, message: "No file received" });
  }

  const fileExt  = req.file.originalname.split(".").pop();
  const fileName = `user_${id}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("pulse-tracker")
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });

  if (uploadError) {
    console.log("Storage upload error:", uploadError);
    return res.json({ success: false, message: "Upload failed" });
  }

  const { data: urlData } = supabase.storage
    .from("pulse-tracker")
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  const { error: dbError } = await supabase
    .from("users")
    .update({ profilePic: publicUrl })
    .eq("user_id", id);

  if (dbError) {
    console.log("DB update error:", dbError);
    return res.json({ success: false });
  }

  res.json({ success: true, imagePath: publicUrl });
});


// ================= SAVE METRIC =================
app.post("/add-metric", async (req, res) => {
  const { userId, metricType, value1, value2, unit, notes } = req.body;

  const { error } = await supabase
    .from("metrics_data")
    .insert([{ user_id: userId, metric_type: metricType, value1, value2, unit, notes }]);

  if (error) {
    console.log("Metric insert error:", error);
    return res.json({ success: false });
  }

  res.json({ success: true });
});


// ================= GET METRICS =================
app.get("/metrics/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("metrics_data")
    .select("*")
    .eq("user_id", req.params.userId)
    .order("created_at", { ascending: false });

  if (error) return res.json([]);
  res.json(data);
});


// ================= SAVE HEART READING =================
app.post("/save-reading", async (req, res) => {
  const { userId, bpm, spo2 } = req.body;

  const { error } = await supabase
    .from("heart_readings")
    .insert([{ user_id: userId, bpm, spo2 }]);

  if (error) {
    console.log("Reading insert error:", error);
    return res.json({ success: false });
  }

  res.json({ success: true });
});


// ================= GET HEART READINGS =================
app.get("/readings/:userId", async (req, res) => {
  const { data, error } = await supabase
    .from("heart_readings")
    .select("*")
    .eq("user_id", req.params.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return res.json([]);
  res.json(data);
});


// ================= NURSE: GET ALL STUDENTS WITH LATEST DATA =================
app.get("/nurse/students", async (req, res) => {
  try {
    const { data: students, error: studentsErr } = await supabase
      .from("users")
      .select("user_id, username, first_name, middle_name, last_name, profilePic")
      .eq("role", "student")
      .order("first_name", { ascending: true });

    if (studentsErr) {
      console.log("Nurse students error:", studentsErr);
      return res.json([]);
    }

    const results = await Promise.all(students.map(async (student) => {
      const { data: readings } = await supabase
        .from("heart_readings")
        .select("bpm, spo2, created_at")
        .eq("user_id", student.user_id)
        .order("created_at", { ascending: false })
        .limit(1);

      const latestReading = readings && readings[0] ? readings[0] : null;

      const { data: metrics } = await supabase
        .from("metrics_data")
        .select("metric_type, value1, value2, unit, notes, created_at")
        .eq("user_id", student.user_id)
        .order("created_at", { ascending: false });

      const metricMap = {};
      if (metrics) {
        metrics.forEach(m => {
          if (!metricMap[m.metric_type]) metricMap[m.metric_type] = m;
        });
      }

      return {
        ...student,
        latest_bpm:      latestReading ? latestReading.bpm        : null,
        latest_spo2:     latestReading ? latestReading.spo2       : null,
        last_reading_at: latestReading ? latestReading.created_at : null,
        sleep:    metricMap["sleep"]    || null,
        water:    metricMap["water"]    || null,
        calories: metricMap["calories"] || null,
        steps:    metricMap["steps"]    || null,
        stress:   metricMap["stress"]   || null,
      };
    }));

    res.json(results);

  } catch (err) {
    console.error("Nurse dashboard error:", err);
    res.json([]);
  }
});


// ================= ADMIN: GET ALL NURSES =================
app.get("/admin/nurses", async (req, res) => {
  const adminId = req.query.adminId;

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.role !== "admin") {
    return res.json({ success: false, message: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("user_id, username, first_name, middle_name, last_name, created_at")
    .eq("role", "nurse")
    .order("first_name", { ascending: true });

  if (error) return res.json([]);
  res.json(data);
});


// ================= ADMIN: CREATE NURSE =================
app.post("/admin/create-nurse", async (req, res) => {
  const { adminId, username, password, first_name, middle_name, last_name } = req.body;

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.role !== "admin") {
    return res.json({ success: false, message: "Unauthorized" });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();

  if (existing) {
    return res.json({ success: false, message: "Username already taken" });
  }

  const { error } = await supabase
    .from("users")
    .insert([{ username, password_hash: password, first_name, middle_name, last_name, role: "nurse" }])
    .select()
    .single();

  if (error) return res.json({ success: false, message: "Database error" });

  res.json({ success: true, message: "Nurse account created!" });
});


// ================= ADMIN: DELETE NURSE =================
app.delete("/admin/delete-nurse/:id", async (req, res) => {
  const nurseId = req.params.id;
  const adminId = req.query.adminId;

  // Verify requester is admin
  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", adminId)
    .single();

  if (!admin || admin.role !== "admin") {
    return res.json({ success: false, message: "Unauthorized" });
  }

  // Verify target is actually a nurse (safety check)
  const { data: target } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", nurseId)
    .single();

  if (!target || target.role !== "nurse") {
    return res.json({ success: false, message: "Target is not a nurse account" });
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("user_id", nurseId);

  if (error) {
    console.log("Delete nurse error:", error);
    return res.json({ success: false, message: "Delete failed" });
  }

  res.json({ success: true });
});


// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});