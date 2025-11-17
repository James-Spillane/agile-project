// routes/screenTime.js
const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');  // the same model you used for /api/entries

// GET the screen-time page
router.get('/screen-time', (req, res) => {
  res.render('screen-time', {
    title: 'Screen Time',
    stats: {
      ageGroup: '18–24',
      averageHours: 5,
      topApps: ['TikTok', 'Instagram', 'YouTube']
    },
    totalTime: 0,
    recommendations: [
      'Try grayscale mode for a day',
      'Disable non-essential notifications',
      'Charge your phone outside the bedroom',
      'Set 2 × 25-min focus blocks'
    ]
  });
});


// POST: called automatically when the user leaves the page
router.post('/track-time', async (req, res) => {
  try {
    const { duration } = req.body; // seconds spent on the page
    const hours = Math.round((duration / 3600) * 100) / 100; // convert to hours
    await Entry.create({
      userId: 'anon',
      screenTime: hours,
      sleepHours: 0,
      stress: undefined,
      mood: undefined
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
