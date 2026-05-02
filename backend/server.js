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
  const { username, password, first_name, middle_name, last_name } = req.body;

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
    .insert([{ username, password_hash: password, first_name, middle_name, last_name }]);

  if (error) {
    console.log("Register error:", error);
    return res.json({ success: false, message: "Database error" });
  }

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

  // Use user_id as filename so each user always overwrites their own pic
  const fileExt  = req.file.originalname.split(".").pop();
  const fileName = `user_${id}.${fileExt}`;

  // Upload to Supabase Storage bucket "pulse-tracker"
  const { error: uploadError } = await supabase.storage
    .from("pulse-tracker")
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true  // overwrite if exists
    });

  if (uploadError) {
    console.log("Storage upload error:", uploadError);
    return res.json({ success: false, message: "Upload failed" });
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("pulse-tracker")
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;

  // Save public URL to users table
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


// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
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