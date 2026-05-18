const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');

// 1. User Form Submit (Request Route)
router.post('/request', async (req, res) => {
    try {
        const { userName, userEmail, course, utrNumber } = req.body;
        
        // Save data to MongoDB collections mava
        const newRequest = new Certificate({ ...req.body, status: 'Pending' });
        await newRequest.save();
        console.log("✅ Data saved to MongoDB successfully!");

        // Triggering IPv4 Alert Mail over a safe secondary try block
        try {
            await sendAdminNotification(newRequest);
            console.log("✅ Admin notification email sent successfully mava!");
        } catch (mailErr) {
            console.error("⚠️ Email delay warning but database is safe:", mailErr.message);
        }

        // Return positive response to payment.js instantly
        return res.status(201).json({ success: true });

    } catch (err) {
        console.error("❌ Request Pipeline Failure:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 2. User Status Check
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

// 3. Main ID Verification
router.get('/verify/:id', async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.id });
        if (!cert) return res.status(404).json({ success: false, message: "Invalid ID!" });

        res.json({
            success: true,
            userName: cert.userName,
            course: cert.course,
            collegeName: cert.collegeName,
            status: cert.status,
            issuedAt: cert.createdAt
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 4. Admin Middleware
const authAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden mava!" });
    }
};

module.exports = { router, authAdmin };