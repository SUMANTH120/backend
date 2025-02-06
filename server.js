const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3007;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sumanth@123",
  database: "telemed",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

// ----------------------
// Signup Route
// ----------------------
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    
    if (results.length > 0) {
      return res.json({ success: false, message: "User already exists." });
    }

    db.query("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())", 
      [name, email, password], 
      (err) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        res.json({ success: true, message: "User registered successfully." });
      }
    );
  });
});

// ----------------------
// Login Route
// ----------------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });

    if (results.length === 0) {
      return res.json({ success: false, message: "User not found." });
    }

    const user = results[0];
    if (user.password === password) {
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.json({ success: false, message: "Invalid password." });
    }
  });
});

// ----------------------
// Profile Routes
// ----------------------

// GET Profile
app.get("/api/profile", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  db.query("SELECT * FROM profiles WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Internal server error" });

    if (results.length > 0) {
      const profile = results[0];
      profile.dateOfBirth = profile.dateOfBirth ? profile.dateOfBirth.toISOString().split("T")[0] : ""; // Fix DOB format
      res.json({ profile });
    } else {
      res.json({ profile: null });
    }
  });
});

// POST or Update Profile
app.post("/api/profile", (req, res) => {
  const { email, name, fatherName, dateOfBirth, gender, otherDetails } = req.body;

  if (!email || !name || !fatherName || !dateOfBirth || !gender) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query("SELECT * FROM profiles WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      // Update profile
      db.query(
        "UPDATE profiles SET name = ?, fatherName = ?, dateOfBirth = ?, gender = ?, otherDetails = ?, updated_at = NOW() WHERE email = ?",
        [name, fatherName, dateOfBirth, gender, otherDetails, email],
        (err) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ success: true, message: "Profile updated successfully" });
        }
      );
    } else {
      // Insert new profile
      db.query(
        "INSERT INTO profiles (email, name, fatherName, dateOfBirth, gender, otherDetails, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [email, name, fatherName, dateOfBirth, gender, otherDetails],
        (err) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ success: true, message: "Profile created successfully" });
        }
      );
    }
  });
});

// ----------------------
// Start Server
// ----------------------
app.listen(port, () => console.log("Server running on http://localhost:" + port));
