const mongoose = require('mongoose');

const mechanicalAssemblySchema = new mongoose.Schema({
  method: String,
  standard_time: Number,
  key_words: [String] // Cambiado a array para soportar múltiples palabras clave
});

module.exports = mongoose.model('MechanicalAssembly', mechanicalAssemblySchema);
