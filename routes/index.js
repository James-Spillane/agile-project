const express = require('express');
const router = express.Router();
const Booking = require('../models/booking'); // Capitalized to match usage

// Welcome Page
router.get('/welcome', (req, res) => {
  res.render('welcome');
});

// Booking Page
router.get('/book', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.render('book', {
      title: 'Create a New Booking',
      bookings
    });
  } catch (err) {
    console.error('Error retrieving bookings:', err);
    res.render('book', {
      title: 'Create a New Booking',
      bookings: []
    });
  }
});

// Help Page
router.get('/help', (req, res) => { 
  res.render('help'); 
});

// Track Time (only once!)
router.post('/track-time', (req, res) => {
  const { duration } = req.body;

  if (!req.session) {
    return res.status(500).send('Session not initialized');
  }

  if (!req.session.totalTime) {
    req.session.totalTime = 0;
  }

  req.session.totalTime += duration;

  console.log(`User spent ${duration} seconds. Total: ${req.session.totalTime}`);
  res.sendStatus(200);
});

// Screen Time Page
router.get('/screen-time', (req, res) => {
  const totalTime = req.session?.totalTime || 0;

  res.render('screen-time', {
    title: 'Screen Time Insights',
    stats: {
      ageGroup: '18–24',
      averageHours: 9,
      topApps: ['TikTok', 'Instagram', 'YouTube'],
    },
    recommendations: [
      'Go for a walk without your phone',
      'Try a 30-minute journaling challenge',
      'Read one chapter of a physical book',
      'Host a no-phone dinner with friends',
    ],
    totalTime
  });
});

module.exports = router;
