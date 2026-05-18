const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');

// 1. User Form Submit (Request Route Execution)
router.post('/request', async (req, res) => {
    try {
        const { userName, userEmail, course, utrNumber } = req.body;
        
        // Push record entry into MongoDB cluster pipeline database logic
        const newRequest = new Certificate({ ...req.body, status: 'Pending' });
        await newRequest.save();
        console.log("✅ Data entry tracking index verified safe inside MongoDB!");

        // Fire forced IPv4 safe secure notification engine trigger
        try {
            await sendAdminNotification(newRequest);
            console.log("✅ Admin automatic alert mail successfully initiated.");
        } catch (mailErr) {
            console.warn("⚠️ Network handshake delay on mail layers, but MongoDB instance data safely recorded mava:", mailErr.message);
        }

        return res.status(201).json({ success: true });
    } catch (err) {
        console.error("❌ Request path terminal transmission pipeline fault:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 2. User Status Check Engine
router.get('/status/:email', async (req, res) => {
    try {
        const user = await Certificate.findOne({ userEmail: req.params.email }).sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ message: "No record Found" });

        res.json({
            status: user.status,
            name: user.userName,
            userEmail: user.userEmail,
            collegeName: user.collegeName,
            branchRoll: user.branchRoll,
            course: user.course,
            duration: user.duration 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. QR Scanner / ID Tracker Verification Route
router.get('/verify/:id', async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.id });
        if (!cert) return res.status(404).json({ success: false, message: "Invalid ID, records not found!" });

        res.json({
            success: true,
            userName: cert.userName,
            course: cert.course,
            collegeName: cert.collegeName,
            status: cert.status,
            issuedAt: cert.createdAt
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error mava!" });
    }
});

// 4. Middleware: Admin Authentication Token Layer Checks
const authAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Neeku access ledu mava!" });
    }
};

// Admin pending requests endpoint
router.get('/admin/pending', authAdmin, async (req, res) => {
    try {
        const requests = await Certificate.find({ status: 'Pending' });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = { router, authAdmin };