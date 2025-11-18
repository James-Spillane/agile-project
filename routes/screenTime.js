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

    // Dynamic feedback logic stays inside the route
    let message = '';
    let recommendations = [];
    if (lastEntryHours !== null && pop) {
      const Hoursaverage = pop && pop.avgScreenTime ? pop.avgScreenTime : 5;


      if (lastEntryHours < Hoursaverage) {
        message = `Great job! You spent less time than the average of ${Hoursaverage} hours.`;
        recommendations = ['Nice work keeping your screen time low!'];
      } else if (lastEntryHours === Hoursaverage) {
        message = `You matched the average screen time of ${Hoursaverage} hours.`;
        recommendations = ['You’re on track. Keep it up!'];
      } else {
        message = `You spent more time than the average of ${Hoursaverage} hours. Consider reducing your screen time for better well-being.`;
        recommendations = [
          'Touch some grass 🌱',
          'Switch off notifications you don’t need',
          'Try a fun offline activity',
          'Charge your phone outside the bedroom',
          'Set a 1-hour phone-free window before bed'
        ];
      }
    }

    res.render('screen-time', {
      title: 'Screen Time',
      stats: {
        ageGroup,
        averageHours: pop ? pop.avgScreenTime : 5,
        topApps: ['TikTok', 'Instagram', 'YouTube']
      },
      totalTime: 0,
      recommendations,
      message,
      comparison,
      lastEntryHours
    });
  } catch (err) {
    console.error('Error in GET /screen-time:', err);
    res.status(500).send('Error loading screen time page');
  }
});
module.exports = router;
