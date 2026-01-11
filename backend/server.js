const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./utils/errorHandler");
const User = require("./models/User");
const requestLogger = require("./middleware/requestLogger");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      email: process.env.DEFAULT_ADMIN_EMAIL,
    });

    if (!adminExists) {
      const adminUser = new User({
        name: "Admin User",
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        isAdmin: true,
      });

      await adminUser.save();
      console.log("Default admin user created");
    } else {
      console.log("Default admin user already exists");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
const medicineRoutes = require("./routes/medicineRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const medicalBillRoutes = require("./routes/medicalBillRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const hospitalBillRoutes = require("./routes/hospitalBillRoutes");
const opdBillRoutes = require("./routes/opdBillRoutes");
const ipdBillRoutes = require("./routes/ipdBillRoutes");
const patientRoutes = require("./routes/patientRoutes"); // Added patient routes import

app.use("/api/medicines", medicineRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/medical-bills", medicalBillRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/hospital-bills", hospitalBillRoutes);
app.use("/api/opd-bills", opdBillRoutes);
app.use("/api/ipd-bills", ipdBillRoutes);
app.use("/api/patients", patientRoutes); // Added patient routes

app.get("/", (req, res) => {
  res.json({ message: "API Running..." });
});

// Error handler
app.use(errorHandler);

// Create default admin user
createDefaultAdmin();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
