const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: String,
    url: String,
    creationDate: Date,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sheetNames: [String],  // Nuevo campo para almacenar los nombres de las hojas del BOM
    excelData: Object       // Opcional: para guardar los datos de las hojas seleccionadas
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
