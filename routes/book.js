const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET booking form
router.get('/', (req, res) => {
  res.render('book', { title: 'Screen Time Tracker' });
});

// POST booking form (save safe fields only)
router.post('/', async (req, res) => {
  try {
    const { name, userId, dateTime, paid } = req.body;

    // Basic server-side validation
    if (!name || !userId || !dateTime) {
      return res.status(400).send('Missing required fields');
    }
    if (userId.length !== 10) {
      return res.status(400).send('User ID must be 10 characters');
    }

    await Booking.create({
      name: name.trim(),
      userId: userId.trim(),
      dateTime: new Date(dateTime),
      paid: paid === 'true'
    });

    // Redirect to confirmation or back to the form with a flash message (simple for now)
    res.redirect('/book');
  } catch (err) {
    console.error(err);
    res.status(500).send('Booking failed');
  }
});

module.exports = router;
