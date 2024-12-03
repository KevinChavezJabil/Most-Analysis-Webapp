const mongoose = require('mongoose');

// Definición de SheetSchema
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

// Exportar SheetSchema si es necesario en otros lugares
const SheetSchema = mongoose.model('Sheet', sheetSchema);

const projectSchema = new mongoose.Schema({
    name: String,
    url: String,
    creationDate: Date,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sheets: { type: [sheetSchema], default: [] }, // Usamos sheetSchema aquí
    sheetNames: [String],
    excelData: {
        type: Map,
        of: [
            {
                partNumber: String,
                description: String,
                quantity: Number,
                component: { type: mongoose.Schema.Types.ObjectId, ref: 'MechanicalComponent' },
                methods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MechanicalAssembly' }],
            },
        ],
    },
});

module.exports = mongoose.model('Project', projectSchema);
