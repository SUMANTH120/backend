require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB Connection Error:", err));

// Doctor Schema & Model
const doctorSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  specialty: String,
  experience: Number,
  patientsConsulted: Number,
  image: String
});

const Doctor = mongoose.model("Doctor", doctorSchema);

// API Route: Get Doctors by Specialty
app.get("/api/doctors", async (req, res) => {
  try {
    const specialty = req.query.specialty;
    if (!specialty) {
      return res.status(400).json({ message: "Specialty is required" });
    }
    
    const doctors = await Doctor.find({ specialty });
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
