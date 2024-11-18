const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: String,
    url: String,
    creationDate: Date,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sheetNames: [String],  // Nuevo campo para almacenar los nombres de las hojas del BOM
    excelData: {
        type: Map, // O usa un array de objetos si las hojas tienen estructuras fijas
        of: Array, // Cada hoja será un array de filas
    },
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
