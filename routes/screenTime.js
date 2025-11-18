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
    let pop = await PopulationStat.findOne({ ageGroup });
    if (!pop) {
      pop = await PopulationStat.findOne();
      if (pop) ageGroup = pop.ageGroup;
    }

    const last = await Entry.findOne().sort({ createdAt: -1 });
    let comparison = null;
    let lastEntryHours = last ? last.screenTime : null;

    if (pop && last) {
      const percentile = percentileRank(pop.distribution || [], last.screenTime);
      const interpretation = percentile !== null
        ? `Your screen time is higher than ${percentile}% of people in the ${ageGroup} group.`
        : 'Not enough population data to calculate a percentile.';

      comparison = {
        population: pop,
        you: { screenTime: last.screenTime, ageGroup },
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
        'Touch some grass',
      ],
      comparison,
      lastEntryHours
    });
  } catch (err) {
    console.error('Error in GET /screen-time:', err);
    res.status(500).send('Error loading screen time page');
  }
});

// GET /track-time-test → starts from 0
router.get('/track-time-test', (req, res) => {
  const duration = 0;
  const Hoursaverage = 5;
  const message = `You've just started tracking your screen time.`;
  const recommendations = [
    'chill without the phone for awhile',
  ];

  res.render('screen-time', {
    title: 'Screen Time',
    stats: { ageGroup: '18–24', averageHours: Hoursaverage, topApps: ['TikTok','Instagram','YouTube'] },
    totalTime: duration,
    recommendations,
    message,
    comparison: null,
    lastEntryHours: null
  });
});

// GET /view-time-test/:duration
router.get('/view-time-test/:duration', (req, res) => {
  const duration = parseInt(req.params.duration);
  const hours = Math.round((duration / 3600) * 100) / 100;
  const Hoursaverage = 5;
  let message = '';
  let recommendations = [];

  if (hours < Hoursaverage) {
    message = `Great job! You spent less time than the average of ${Hoursaverage} hours.`;
    recommendations = ['Good job for keeping your screen time low, buddy'];
  } else if (hours === Hoursaverage) {
    message = `You matched the average screen time of ${Hoursaverage} hours.`;
    recommendations = ['You’re on track. Keep it up!'];
  } else {
    message = `You spent more time than the average of ${Hoursaverage} hours. Consider reducing your screen time for better well-being.`;
    recommendations = [
      'Touch some grass',
      'switch off useless notifications',
      'Do some fun activites offline',
      'Charge your phone outside the bedroom',
      'Set 1 hour as a for no-access to the phone before bed'
    ];
  }

  res.render('screen-time', {
    title: 'Screen Time',
    stats: { ageGroup: '18–24', averageHours: Hoursaverage, topApps: ['TikTok','Instagram','YouTube'] },
    totalTime: duration,
    recommendations,
    message,
    comparison: null,
    lastEntryHours: null
  });
});
module.exports = router;