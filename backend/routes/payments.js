const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/payments/initiate - Sandbox payment initiation
router.post('/initiate', authenticate, (req, res) => {
  const { appointmentId } = req.body;
  const appt = global.db.appointments.find(a => a.id === appointmentId);

  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  res.json({
    success: true,
    order: {
      id: orderId,
      amount: appt.fee * 100, // Razorpay expects paise
      currency: 'INR',
      appointmentId,
      sandboxKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_sandbox_demo'
    }
  });
});

// POST /api/payments/confirm - Confirm sandbox payment
router.post('/confirm', authenticate, (req, res) => {
  const { appointmentId, paymentId, orderId } = req.body;

  const apptIdx = global.db.appointments.findIndex(a => a.id === appointmentId);
  if (apptIdx === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const appt = global.db.appointments[apptIdx];

  const payment = {
    id: uuidv4(),
    appointmentId,
    patientId: req.user.id,
    doctorId: appt.doctorId,
    amount: appt.fee,
    status: 'paid',
    method: 'razorpay_sandbox',
    transactionId: paymentId || `TXN_SANDBOX_${Date.now()}`,
    orderId,
    createdAt: new Date().toISOString()
  };

  global.db.payments.push(payment);
  global.db.appointments[apptIdx] = { ...appt, paid: true, status: 'confirmed' };

  res.json({ success: true, message: 'Payment successful', payment });
});

// GET /api/payments/history - Patient billing history
router.get('/history', authenticate, (req, res) => {
  let payments = [];
  if (req.user.role === 'patient') {
    payments = global.db.payments.filter(p => p.patientId === req.user.id);
  } else if (req.user.role === 'doctor') {
    payments = global.db.payments.filter(p => p.doctorId === req.user.id);
  } else {
    payments = global.db.payments;
  }

  const enriched = payments.map(p => {
    const appt = global.db.appointments.find(a => a.id === p.appointmentId);
    const doctor = global.db.users.find(u => u.id === p.doctorId);
    return { ...p, appointment: appt || null, doctorName: doctor?.name };
  });

  res.json({ success: true, payments: enriched, total: payments.reduce((s, p) => s + p.amount, 0) });
});

module.exports = router;
