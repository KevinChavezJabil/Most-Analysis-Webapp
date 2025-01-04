const mongoose = require('mongoose');

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
    creationDate: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sheets: { type: [sheetSchema], default: [] }, 
});

module.exports = mongoose.model('Project', projectSchema);
