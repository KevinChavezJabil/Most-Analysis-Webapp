const mongoose = require('mongoose');

// Definición de SheetSchema como subdocumento
const sheetSchema = new mongoose.Schema({
    name: String,
    data: [
        {
            partNumber: String,
            description: String,
            quantity: Number,
            component: { type: mongoose.Schema.Types.ObjectId, ref: 'MechanicalComponent' },
            methods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MechanicalAssembly' }],
            cycleTime: Number,
        },
    ],
});

const projectSchema = new mongoose.Schema({
    name: String,
    url: String,
    creationDate: Date,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sheets: { type: [sheetSchema], default: [] }, // Usamos subdocumentos
});

module.exports = mongoose.model('Project', projectSchema);

