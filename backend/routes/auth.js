const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'meditrack_secret_2024';
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialisation, location, experience, fee, bio, age, bloodGroup, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    const existingUser = global.db.users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name, email,
      password: hashedPassword,
      role,
      approved: role === 'patient', // patients auto-approved; doctors need admin approval
      createdAt: new Date().toISOString(),
      ...(role === 'doctor' && { specialisation, location, experience: +experience || 0, fee: +fee || 500, bio, rating: 0, available: false, slots: [], availableDays: [] }),
      ...(role === 'patient' && { age: +age || null, bloodGroup, phone })
    };

    global.db.users.push(newUser);
    const token = generateToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ success: true, message: 'Registration successful', token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = global.db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.approved && user.role === 'doctor') {
      return res.status(403).json({ success: false, message: 'Your doctor account is pending admin approval' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ success: true, message: 'Login successful', token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ success: true, user: userWithoutPassword });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const idx = global.db.users.findIndex(u => u.id === req.user.id);
    const { password, role, ...updates } = req.body;
    global.db.users[idx] = { ...global.db.users[idx], ...updates };
    const { password: _, ...updated } = global.db.users[idx];
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
