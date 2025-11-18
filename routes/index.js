const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Blink' });
});

router.get('/mascot', (req, res) => {
    res.render('mascot');
});


module.exports = router;
