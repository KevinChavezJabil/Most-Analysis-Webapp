const mongoose = require('mongoose');

const mechanicalAssemblySchema = new mongoose.Schema({
  method: String,
  standard_time: Number,
  key_words: String
});

module.exports = mongoose.model('MechanicalAssembly', mechanicalAssemblySchema);
