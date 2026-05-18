const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');

// 1. User Form Submit (Request Route Generation Framework)
router.post('/request', async (req, res) => {
    try {
        const { userName, userEmail, course, utrNumber } = req.body;
        
        // Save new record tracking instance values inside MongoDB collection clusters mava
        const newRequest = new Certificate({ ...req.body, status: 'Pending' });
        await newRequest.save();
        console.log("✅ Data entity verified and successfully written inside MongoDB!");

        // Execute unified safe API wrapper notification dispatch
        try {
            await sendAdminNotification(newRequest);
            console.log("✅ Direct Admin notification task sequence triggered successfully.");
        } catch (mailErr) {
            console.warn("⚠️ Dynamic communication layer network response delayed, but DB instance is 100% secure mava:", mailErr.message);
        }

        return res.status(201).json({ success: true });
    } catch (err) {
        console.error("❌ Pipeline critical transaction exception stack trace:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 2. User Status Check Pipeline
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

// 3. ID Scanner Verification Matrix Point
router.get('/verify/:id', async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.id });
        if (!cert) return res.status(404).json({ success: false, message: "Invalid ID parameter checks matching failed!" });

        res.json({
            success: true,
            userName: cert.userName,
            course: cert.course,
            collegeName: cert.collegeName,
            status: cert.status,
            issuedAt: cert.createdAt
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server registry context matching crash mava!" });
    }
});

// 4. Middleware: Auth Token Admin Verification Checks
const authAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden context access denied mava!" });
    }
};

// Admin pending listings fetch pipeline
router.get('/admin/pending', authAdmin, async (req, res) => {
    try {
        const requests = await Certificate.find({ status: 'Pending' });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = { router, authAdmin };