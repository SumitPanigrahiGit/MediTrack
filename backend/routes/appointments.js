const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/appointments - Get user's appointments
router.get('/', authenticate, (req, res) => {
  let appointments = [];

  if (req.user.role === 'patient') {
    appointments = global.db.appointments.filter(a => a.patientId === req.user.id);
  } else if (req.user.role === 'doctor') {
    appointments = global.db.appointments.filter(a => a.doctorId === req.user.id);
  } else if (req.user.role === 'admin') {
    appointments = global.db.appointments;
  }

  const enriched = appointments.map(a => {
    const doctor = global.db.users.find(u => u.id === a.doctorId);
    const patient = global.db.users.find(u => u.id === a.patientId);
    return {
      ...a,
      doctor: doctor ? { id: doctor.id, name: doctor.name, specialisation: doctor.specialisation, location: doctor.location } : null,
      patient: patient ? { id: patient.id, name: patient.name, age: patient.age, phone: patient.phone } : null
    };
  });

  res.json({ success: true, appointments: enriched });
});

// POST /api/appointments - Book an appointment
router.post('/', authenticate, authorize('patient'), (req, res) => {
  const { doctorId, date, time, type, notes } = req.body;

  if (!doctorId || !date || !time) {
    return res.status(400).json({ success: false, message: 'Doctor, date and time are required' });
  }

  const doctor = global.db.users.find(u => u.id === doctorId && u.role === 'doctor');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  // Check slot availability
  const conflict = global.db.appointments.find(a =>
    a.doctorId === doctorId && a.date === date && a.time === time && !['cancelled', 'rejected'].includes(a.status)
  );
  if (conflict) return res.status(400).json({ success: false, message: 'This slot is already booked' });

  const newAppointment = {
    id: uuidv4(),
    patientId: req.user.id,
    doctorId,
    date,
    time,
    type: type || 'in-person',
    status: 'pending',
    fee: doctor.fee || 500,
    paid: false,
    notes: notes || '',
    prescription: null,
    createdAt: new Date().toISOString()
  };

  global.db.appointments.push(newAppointment);

  const enriched = {
    ...newAppointment,
    doctor: { id: doctor.id, name: doctor.name, specialisation: doctor.specialisation }
  };

  res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment: enriched });
});

// PUT /api/appointments/:id/status - Update appointment status
router.put('/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  const idx = global.db.appointments.findIndex(a => a.id === req.params.id);

  if (idx === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const appt = global.db.appointments[idx];

  // Permissions check
  if (req.user.role === 'patient' && appt.patientId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  if (req.user.role === 'doctor' && appt.doctorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  global.db.appointments[idx] = { ...appt, status, updatedAt: new Date().toISOString() };
  res.json({ success: true, message: `Appointment ${status}`, appointment: global.db.appointments[idx] });
});

// GET /api/appointments/:id
router.get('/:id', authenticate, (req, res) => {
  const appt = global.db.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

  const doctor = global.db.users.find(u => u.id === appt.doctorId);
  const patient = global.db.users.find(u => u.id === appt.patientId);

  res.json({
    success: true,
    appointment: {
      ...appt,
      doctor: doctor ? { id: doctor.id, name: doctor.name, specialisation: doctor.specialisation, location: doctor.location, fee: doctor.fee } : null,
      patient: patient ? { id: patient.id, name: patient.name, age: patient.age, bloodGroup: patient.bloodGroup, phone: patient.phone } : null
    }
  });
});

module.exports = router;
