// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// // Initialize Express App
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("✅ Connected to MongoDB"))
// .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // Doctor Schema & Model
// const doctorSchema = new mongoose.Schema({
//   name: String,
//   age: Number,
//   gender: String,
//   specialty: String,
//   experience: Number,
//   patientsConsulted: Number,
//   image: String
// }, { collection: "doctors" });

// const Doctor = mongoose.model("doctors", doctorSchema);

// // API Route: Get Doctors by Specialty
// app.get("/api/doctors", async (req, res) => {
//   try {
//     const specialty = req.query.specialty;
//     console.log(req.query)
//     if (!specialty) {
//       return res.status(400).json({ message: "Specialty is required" });
//     }
    
//     const doctors = await Doctor.find({ specialty });
//     res.json(doctors);
//   } catch (error) {
//     console.error("Error fetching doctors:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // Start Server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

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
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Doctor Schema & Model
const doctorSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: String,
    specialty: String,
    experience: Number,
    patientsConsulted: Number,
    image: String,
  },
  { collection: "doctors" }
);

const Doctor = mongoose.model("doctors", doctorSchema);

// Appointment Schema & Model
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  appointmentTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model("appointments", appointmentSchema);

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

// API Route: Book an Appointment
app.post("/api/appointments/book", async (req, res) => {
  try {
    const { userId, doctorId, doctorName, specialty } = req.body;
    if (!userId || !doctorId || !doctorName || !specialty) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const appointment = new Appointment({ userId, doctorId, doctorName, specialty });
    await appointment.save();
    res.status(201).json({ message: "Appointment booked. Confirm timing in My Appointments.", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API Route: Get User Appointments
app.get("/api/appointments/:userId", async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API Route: Update Appointment Time
app.put("/api/appointments/update/:id", async (req, res) => {
  try {
    const { appointmentTime } = req.body;
    if (!appointmentTime) {
      return res.status(400).json({ message: "Appointment time is required" });
    }

    await Appointment.findByIdAndUpdate(req.params.id, { appointmentTime, status: "Confirmed" });
    res.json({ message: "Appointment confirmed", appointmentTime });
  } catch (error) {
    console.error("Error updating appointment time:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API Route: Cancel Appointment
app.delete("/api/appointments/cancel/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment cancelled" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

