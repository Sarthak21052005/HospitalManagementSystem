// app.js - Hospital Management System Backend (Refactored)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/database');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const receptionRoutes = require('./routes/reception.routes');
const adminRoutes = require('./routes/admin.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const doctorRoutes = require('./routes/doctor.routes');
const nurseRoutes = require('./routes/nurse.routes');
const labRoutes = require('./routes/lab.routes'); // ✅ ADDED LAB ROUTES

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

app.use(session({
  store: new pgSession({ pool }),
  secret: process.env.SESSION_SECRET || 'hospital-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false
  }
}));

// ===== ROUTES =====
// ✅ FIXED: Changed from /api to /api/auth to match frontend API calls
app.use('/api/auth', authRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/lab',labRoutes); // ✅ ADDED LAB ROUTES

// ===== ERROR HANDLERS =====
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.path}`); // ✅ ADDED for debugging
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ===== START SERVER =====
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  Hospital Management System Backend          ║');
  console.log(`║  Port: ${PORT}                                  ║`);
  console.log(`║  Environment: ${config.server.environment}              ║`);
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log('✅ Backend server is running');
  console.log(`📍 API Base: http://localhost:${PORT}/api\n`);
  console.log('🔐 Authentication:');
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/session`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout\n`);
  console.log('🏥 Reception:');
  console.log(`   GET  http://localhost:${PORT}/api/reception/patients`);
  console.log(`   POST http://localhost:${PORT}/api/reception/register\n`);
  console.log('👨‍⚕️  Doctor:');
  console.log(`   GET  http://localhost:${PORT}/api/doctor/stats`);
  console.log(`   GET  http://localhost:${PORT}/api/doctor/patients\n`);
  console.log('👩‍⚕️  Nurse:');
  console.log(`   GET  http://localhost:${PORT}/api/nurse/stats`);
  console.log(`   GET  http://localhost:${PORT}/api/nurse/wards\n`);
  console.log('🔬 Lab Technician:');
  console.log(`   GET  http://localhost:${PORT}/api/lab/orders/pending`);
  console.log(`   PUT  http://localhost:${PORT}/api/lab/orders/:id/status\n`);
  console.log('⚙️  Admin:');
  console.log(`   GET  http://localhost:${PORT}/api/admin/doctors`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/nurses\n`);
});
