// routes/api.js
const express = require('express');
const mongoose = require('mongoose');
const Entry = require('../models/Entry');

const router = express.Router();

// Simple ping
router.get('/', (_req, res) => res.json({ ok: true }));

// Health check
router.get('/health', (_req, res) => {
  const states = ['disconnected','connected','connecting','disconnecting','unauthorized','unknown'];
  res.json({ mongo: states[mongoose.connection.readyState] || mongoose.connection.readyState });
});

// Create entry
router.post('/entries', async (req, res) => {
  try {
    const entry = await Entry.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List latest 10 entries
router.get('/entries', async (_req, res) => {
  const entries = await Entry.find().sort({ createdAt: -1 }).limit(10);
  res.json(entries);
});

module.exports = router;
