const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/doctors - Search & filter doctors
router.get('/', (req, res) => {
  const { specialisation, location, rating, available, search } = req.query;

  let doctors = global.db.users.filter(u => u.role === 'doctor' && u.approved);

  if (specialisation) doctors = doctors.filter(d => d.specialisation?.toLowerCase().includes(specialisation.toLowerCase()));
  if (location) doctors = doctors.filter(d => d.location?.toLowerCase().includes(location.toLowerCase()));
  if (rating) doctors = doctors.filter(d => d.rating >= parseFloat(rating));
  if (available === 'true') doctors = doctors.filter(d => d.available);
  if (search) {
    const q = search.toLowerCase();
    doctors = doctors.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.specialisation?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q)
    );
  }

  const safeDoctors = doctors.map(({ password, ...d }) => d);
  res.json({ success: true, doctors: safeDoctors, total: safeDoctors.length });
});

// GET /api/doctors/specialisations
router.get('/specialisations', (req, res) => {
  const specs = [...new Set(global.db.users.filter(u => u.role === 'doctor' && u.approved).map(d => d.specialisation).filter(Boolean))];
  res.json({ success: true, specialisations: specs });
});

// GET /api/doctors/:id
router.get('/:id', (req, res) => {
  const doctor = global.db.users.find(u => u.id === req.params.id && u.role === 'doctor');
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  const { password, ...safeDoctor } = doctor;
  res.json({ success: true, doctor: safeDoctor });
});

// PUT /api/doctors/availability - Doctor updates their schedule
router.put('/availability', authenticate, authorize('doctor'), (req, res) => {
  const { slots, availableDays, available } = req.body;
  const idx = global.db.users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Doctor not found' });

  global.db.users[idx] = {
    ...global.db.users[idx],
    ...(slots !== undefined && { slots }),
    ...(availableDays !== undefined && { availableDays }),
    ...(available !== undefined && { available })
  };

  const { password, ...updated } = global.db.users[idx];
  res.json({ success: true, message: 'Availability updated', doctor: updated });
});

// GET /api/doctors/:id/appointments - Doctor's appointments
router.get('/:id/appointments', authenticate, authorize('doctor', 'admin'), (req, res) => {
  const appointments = global.db.appointments
    .filter(a => a.doctorId === req.params.id)
    .map(a => {
      const patient = global.db.users.find(u => u.id === a.patientId);
      return { ...a, patient: patient ? { id: patient.id, name: patient.name, age: patient.age, bloodGroup: patient.bloodGroup, phone: patient.phone } : null };
    });
  res.json({ success: true, appointments });
});

module.exports = router;
