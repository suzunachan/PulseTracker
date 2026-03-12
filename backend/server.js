const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// ================= SUPABASE =================
const SUPABASE_URL = "https://misvuvddshojtqxokbsc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3Z1dmRkc2hvanRxeG9rYnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDc2NDMsImV4cCI6MjA4ODg4MzY0M30.v7Sgd-nmE8lRjKaBpcvJUpnusrskVbWzFC2TSqZVyR4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// ================= FILE UPLOAD =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  const { data: existing } = await supabase
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();

  if (existing) {
    return res.json({ success: false, message: "Username already taken" });
  }

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password_hash: password }])
    .select()
    .single();

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

  // Check if username already taken
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

  const imagePath = "/uploads/" + req.file.filename;

  const { error } = await supabase
    .from("users")
    .update({ profilePic: imagePath })
    .eq("user_id", id);

  if (error) {
    console.log("DB error:", error);
    return res.json({ success: false });
  }

  res.json({ success: true, imagePath });
});


// ================= SAVE METRIC =================
app.post("/add-metric", async (req, res) => {
  const { userId, metricType, value1, value2, unit, notes } = req.body;

  const { error } = await supabase
    .from("metrics_data")
    .insert([{
      user_id: userId,
      metric_type: metricType,
      value1,
      value2,
      unit,
      notes
    }]);

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