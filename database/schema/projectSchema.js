const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: String,
    url: String,
    creationDate: Date,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
