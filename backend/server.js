const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Smart MCH API is running ✓' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mothers', require('./routes/motherRoutes'));
app.use('/api/risk', require('./routes/riskRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/children', require('./routes/childRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/vaccination', require('./routes/vaccinationRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});