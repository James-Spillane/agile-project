const mongoose = require('mongoose');

const populationStatSchema = new mongoose.Schema({
  ageGroup: { type: String, required: true },      // e.g. '18-24' or 'all'
  avgScreenTime: { type: Number, required: true }, // hours/day
  p25: Number,
  p50: Number,
  p75: Number,
  sampleSize: Number
}, { timestamps: true });

module.exports = mongoose.model('PopulationStat', populationStatSchema);
