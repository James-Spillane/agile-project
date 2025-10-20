const express = require('express');
const router = express.Router();

// GET booking form
router.get('/', (req, res) => {
  res.render('book', { title: 'Screen Time Tracker' });
});

// POST booking form (placeholder)
router.post('/', (req, res) => {
  // TODO: save booking or forward to API
  res.redirect('/book'); // for now, just reload
});

module.exports = router;
