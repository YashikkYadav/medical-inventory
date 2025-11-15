const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const User = require('./models/User');
const requestLogger = require('./middleware/requestLogger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'API Running...' });
});

// Error handler
app.use(errorHandler);

// Create default admin user
createDefaultAdmin();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});