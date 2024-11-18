const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: String,
    url: String,
    creationDate: Date,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sheetNames: [String],  // Nuevo campo para almacenar los nombres de las hojas del BOM
<<<<<<< HEAD
    excelData: {
        type: Map, // O usa un array de objetos si las hojas tienen estructuras fijas
        of: Array, // Cada hoja será un array de filas
    },
=======
    excelData: Object       // Opcional: para guardar los datos de las hojas seleccionadas
>>>>>>> 9fa256fa03dc376ffd303b554f0477c5cf116102
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
