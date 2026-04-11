const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Serve Frontend Dashboard (CRITICAL FOR RENDER) ───────────────
// Look for frontend build (relative to root, not backend folder)
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Serving frontend dashboard from:', frontendBuildPath);
  
  // Serve static files
  app.use(express.static(frontendBuildPath));
  
  // IMPORTANT: Handle React Router - all non-API routes go to index.html
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Serve index.html for all other routes (React Router)
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build not found at:', frontendBuildPath);
  console.log('   Build frontend with: cd frontend && npm run build');
}

// ─── In-Memory Data Store ─────────────────────────────────────────
global.db = {
  users: [
    {
      id: 'u1',
      name: 'Dr. Aisha Sharma',
      email: 'doctor@meditrack.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'doctor',
      specialisation: 'Cardiology',
      location: 'Mumbai',
      rating: 4.8,
      experience: 12,
      fee: 800,
      available: true,
      slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      bio: 'Expert cardiologist with 12 years of experience.',
      approved: true,
      avatar: null
    },
    {
      id: 'u2',
      name: 'Dr. Rahul Mehta',
      email: 'doctor2@meditrack.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'doctor',
      specialisation: 'Neurology',
      location: 'Delhi',
      rating: 4.6,
      experience: 8,
      fee: 1200,
      available: true,
      slots: ['10:00', '11:00', '12:00', '15:00', '16:00'],
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      bio: 'Neurologist specializing in epilepsy and migraines.',
      approved: true,
      avatar: null
    },
    {
      id: 'u3',
      name: 'Dr. Priya Nair',
      email: 'doctor3@meditrack.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'doctor',
      specialisation: 'Dermatology',
      location: 'Bangalore',
      rating: 4.9,
      experience: 6,
      fee: 600,
      available: true,
      slots: ['09:00', '10:00', '14:00', '15:00', '16:00', '17:00'],
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      bio: 'Dermatologist with expertise in cosmetic dermatology.',
      approved: true,
      avatar: null
    },
    {
      id: 'u4',
      name: 'Admin User',
      email: 'admin@meditrack.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'admin',
      approved: true
    },
    {
      id: 'u5',
      name: 'Kiran Patel',
      email: 'patient@meditrack.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'patient',
      age: 32,
      bloodGroup: 'O+',
      phone: '+91-9876543210',
      approved: true
    }
  ],
  appointments: [
    {
      id: 'a1',
      patientId: 'u5',
      doctorId: 'u1',
      date: '2026-04-15',
      time: '10:00',
      type: 'video',
      status: 'confirmed',
      fee: 800,
      paid: true,
      notes: 'Routine heart checkup',
      prescription: null,
      createdAt: new Date().toISOString()
    }
  ],
  prescriptions: [],
  reports: [],
  payments: [
    {
      id: 'p1',
      appointmentId: 'a1',
      patientId: 'u5',
      doctorId: 'u1',
      amount: 800,
      status: 'paid',
      method: 'razorpay_sandbox',
      transactionId: 'TXN_SANDBOX_001',
      createdAt: new Date().toISOString()
    }
  ],
  medications: []
};

// ─── Routes ───────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const prescriptionRoutes = require('./routes/prescriptions');

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── API Root ─────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '🏥 MediTrack API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler for API routes ──────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found` });
});

// ─── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Start Server ─────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏥 MediTrack Backend running on http://localhost:${PORT}`);
  console.log(`📋 API available at http://localhost:${PORT}/api`);
  if (fs.existsSync(frontendBuildPath)) {
    console.log(`🎨 Frontend Dashboard available at http://localhost:${PORT}`);
  }
  console.log(`\n`);
});

module.exports = app;
