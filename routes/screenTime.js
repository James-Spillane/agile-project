// routes/screenTime.js
const express = require('express');
const router = express.Router();

const Entry = require('../models/Entry');
const PopulationStat = require('../models/PopulationStat');

// helper: returns percentage of people with value <= user's value
function percentileRank(sortedArray, value) {
  if (!sortedArray || !sortedArray.length) return null;

  let countBelowOrEqual = 0;
  for (const v of sortedArray) {
    if (v <= value) countBelowOrEqual++;
    else break; // sorted, so we can stop
  }

  return Math.round((countBelowOrEqual / sortedArray.length) * 100);
}

// GET /screen-time → show stats + Kaggle comparison
router.get('/screen-time', async (req, res) => {
  try {
    let ageGroup = 'all';

    // population stats
    let pop = await PopulationStat.findOne({ ageGroup });

    // if no "all", fall back to first available group
    if (!pop) {
      pop = await PopulationStat.findOne();
      if (pop) ageGroup = pop.ageGroup;
    }

    // latest user entry
    const last = await Entry.findOne().sort({ createdAt: -1 });

    let comparison = null;
    let lastEntryHours = null;          // ✅ define before use

    if (last) {
      lastEntryHours = last.screenTime;
    }

    if (pop && last) {
      const percentile = percentileRank(pop.distribution || [], last.screenTime);

      const you = { screenTime: last.screenTime, ageGroup };

      const interpretation = percentile !== null
        ? `Your screen time is higher than ${percentile}% of people in the ${ageGroup} group.`
        : 'Not enough population data to calculate a percentile.';

      comparison = {
        population: pop,
        you,
        percentile,
        interpretation
      };
    }

    res.render('screen-time', {
      title: 'Screen Time',
      stats: {
        ageGroup,
        averageHours: pop ? pop.avgScreenTime : 0,
        topApps: ['TikTok', 'Instagram', 'YouTube']
      },
      totalTime: 0,
      recommendations: [
        'Try grayscale mode for a day',
        'Disable non-essential notifications',
        'Charge your phone outside the bedroom',
        'Set one hour as a no-phone zone before bed'
      ],
      comparison,
      lastEntryHours              // ✅ passed into view
    });
  } catch (err) {
    console.error('Error in GET /screen-time:', err);
    res.status(500).send('Error loading screen time page');
  }
});

// POST /track-time → log usage from beforeunload beacon
router.post('/track-time', async (req, res) => {
  try {
    const { duration = 0 } = req.body; // seconds
    const hours = Number((duration / 3600).toFixed(2));

    await Entry.create({
      screenTime: hours
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Error in POST /track-time:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
