// routes/screenTime.js
const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');  // the same model you used for /api/entries
const PopulationStat = require('../models/PopulationStat');

// helper: returns percentage of people with value <= user's value
function percentileRank(sortedArray, value) {
  if (!sortedArray || !sortedArray.length) return null;

  let countBelowOrEqual = 0;
  for (const v of sortedArray) {
    if (v <= value) countBelowOrEqual++;
    else break; // array is sorted, so we can stop early
  }

  return Math.round((countBelowOrEqual / sortedArray.length) * 100);
}

// GET /screen-time page
router.get('/screen-time', async (req, res) => {
  try {
    // For now, just use 'all' group.
    // If your Kaggle import created age buckets (18-24, 25-34, etc)
    // you can change this to one of those later.
    let ageGroup = 'all';

    // Get population stats for this group
    let pop = await PopulationStat.findOne({ ageGroup });

    // If there's no 'all' group, just grab ANY one so the page doesn't break
    if (!pop) {
      pop = await PopulationStat.findOne();
      if (pop) ageGroup = pop.ageGroup;
    }

    // Latest user entry from your own DB
    const last = await Entry.findOne().sort({ createdAt: -1 });

    let comparison = null;
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
      totalTime: 0, // starting value for the on-page timer
      recommendations: [
        'Try grayscale mode for a day',
        'Disable non-essential notifications',
        'Charge your phone outside the bedroom',
        'Set one hour as a no-phone zone before bed'
      ],
      comparison
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading screen time page');
  }
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
