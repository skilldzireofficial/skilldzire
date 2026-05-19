const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');

// 1. User Form Submit (Request Route)
router.post('/request', async (req, res) => {
    try {
        const { userName, userEmail, course, utrNumber, branchRoll, collegeName, startDate, endDate } = req.body;
        
        // 🔥 FIX: startDate and endDate ని కలిపి "YYYY-MM-DD to YYYY-MM-DD" లాగా మారుస్తున్నాం mava!
        let calculatedDuration = "May-2026 to July-2026"; 
        if (startDate && endDate) {
            calculatedDuration = `${startDate} to ${endDate}`;
        }

        // Schema లో ఉన్న duration ఫీల్డ్ కి పంపిస్తున్నాం
        const newRequest = new Certificate({ 
            userName,
            userEmail,
            course,
            utrNumber,
            branchRoll,
            collegeName,
            duration: calculatedDuration, // 👈 formatted duration lines!
            status: 'Pending' 
        });
        
        await newRequest.save();
        console.log("✅ MongoDB data entries saved cleanly mava!");

        try {
            await sendAdminNotification(newRequest);
        } catch (mailErr) {
            console.warn("⚠️ Admin mail delayed but database is safe:", mailErr.message);
        }

        return res.status(201).json({ success: true });
    } catch (err) {
        console.error("❌ Database Transaction Error:", err.message);
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