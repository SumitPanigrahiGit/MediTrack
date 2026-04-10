const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// ─── ADMIN ROUTES ─────────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', authenticate, authorize('admin'), (req, res) => {
  const users = global.db.users;
  const stats = {
    totalPatients: users.filter(u => u.role === 'patient').length,
    totalDoctors: users.filter(u => u.role === 'doctor' && u.approved).length,
    pendingDoctors: users.filter(u => u.role === 'doctor' && !u.approved).length,
    totalAppointments: global.db.appointments.length,
    appointmentsToday: global.db.appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    totalRevenue: global.db.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    specialisations: [...new Set(users.filter(u => u.role === 'doctor').map(d => d.specialisation).filter(Boolean))].length
  };
  res.json({ success: true, stats });
});

// GET /api/admin/users
router.get('/users', authenticate, authorize('admin'), (req, res) => {
  const users = global.db.users.map(({ password, ...u }) => u);
  res.json({ success: true, users });
});

// PUT /api/admin/approve-doctor/:id
router.put('/approve-doctor/:id', authenticate, authorize('admin'), (req, res) => {
  const idx = global.db.users.findIndex(u => u.id === req.params.id && u.role === 'doctor');
  if (idx === -1) return res.status(404).json({ success: false, message: 'Doctor not found' });
  global.db.users[idx].approved = true;
  global.db.users[idx].available = true;
  res.json({ success: true, message: 'Doctor approved successfully' });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticate, authorize('admin'), (req, res) => {
  const idx = global.db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
  global.db.users.splice(idx, 1);
  res.json({ success: true, message: 'User removed' });
});

module.exports = router;

