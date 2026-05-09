const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    branchRoll: { type: String, required: true },
    collegeName: { type: String, required: true },
    course: { type: String, required: true },
    certificateId: String,
    utrNumber: String,
    duration: { type: String, required: true }, // Format: "May-2026 to July-2026"
    status: { type: String, default: 'Pending' }, // Pending / Approved
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);