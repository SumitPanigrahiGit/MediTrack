const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// POST /api/prescriptions - Write a prescription
router.post('/', authenticate, authorize('doctor'), (req, res) => {
  const { appointmentId, patientId, medicines, notes, followUpDate } = req.body;

  const prescription = {
    id: uuidv4(),
    appointmentId,
    patientId,
    doctorId: req.user.id,
    doctorName: req.user.name,
    specialisation: req.user.specialisation,
    medicines: medicines || [], // [{name, dosage, duration, timing}]
    notes: notes || '',
    followUpDate: followUpDate || null,
    createdAt: new Date().toISOString()
  };

  global.db.prescriptions.push(prescription);

  // Link to appointment
  const apptIdx = global.db.appointments.findIndex(a => a.id === appointmentId);
  if (apptIdx !== -1) {
    global.db.appointments[apptIdx].prescription = prescription.id;
    global.db.appointments[apptIdx].status = 'completed';
  }

  res.status(201).json({ success: true, prescription });
});

// GET /api/prescriptions - Get prescriptions
router.get('/', authenticate, (req, res) => {
  let prescriptions = [];

  if (req.user.role === 'patient') {
    prescriptions = global.db.prescriptions.filter(p => p.patientId === req.user.id);
  } else if (req.user.role === 'doctor') {
    prescriptions = global.db.prescriptions.filter(p => p.doctorId === req.user.id);
  } else {
    prescriptions = global.db.prescriptions;
  }

  res.json({ success: true, prescriptions });
});

// GET /api/prescriptions/:id
router.get('/:id', authenticate, (req, res) => {
  const prescription = global.db.prescriptions.find(p => p.id === req.params.id);
  if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
  res.json({ success: true, prescription });
});

// POST /api/prescriptions/medication-reminder
router.post('/medication-reminder', authenticate, (req, res) => {
  const { medicine, time, frequency, startDate, endDate } = req.body;

  const reminder = {
    id: uuidv4(),
    patientId: req.user.id,
    medicine,
    time,
    frequency,
    startDate,
    endDate,
    active: true,
    createdAt: new Date().toISOString()
  };

  global.db.medications.push(reminder);
  res.status(201).json({ success: true, reminder });
});

// GET /api/prescriptions/reminders/me
router.get('/reminders/me', authenticate, (req, res) => {
  const reminders = global.db.medications.filter(m => m.patientId === req.user.id);
  res.json({ success: true, reminders });
});

module.exports = router;
