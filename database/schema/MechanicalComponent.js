const mongoose = require('mongoose');

const mechanicalComponentSchema = new mongoose.Schema({
  component: String,
  standard_time: Number,
  key_words: [String]
});

module.exports = mongoose.model('MechanicalComponent', mechanicalComponentSchema);
