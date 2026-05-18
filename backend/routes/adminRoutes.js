const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendCertificateMail } = require('../utils/emailHelper');
const { generateCertificate } = require('../utils/pdfHelper');
const { authAdmin } = require('./certRoutes'); 

// 1. Get all pending requests
router.get('/pending', authAdmin, async (req, res) => {
    try {
        const pending = await Certificate.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: "Error on fetching requests!" });
    }
});

// 2. Approve and Send Certificate - FULL FIXED HANDSHAKE MAVA
router.post('/approve/:id', authAdmin, async (req, res) => {
    try {
        const user = await Certificate.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not Found!" });

        const generatedCertId = `SD-${user._id.toString().slice(-6).toUpperCase()}`;
        user.certificateId = generatedCertId; 
        user.status = 'Approved';
        await user.save();

        // PDF Generation
        const fullPdfPath = await generateCertificate(user);

        // Safe user mail trigger
        try {
            await sendCertificateMail(user.userEmail, fullPdfPath, user.userName);
            console.log("✅ User certificate mail sent over IPv4 channel!");
        } catch (mailErr) {
            console.error("⚠️ User certificate email transmission slow:", mailErr.message);
        }

        res.json({ 
            success: true, 
            message: `Approved mava! ID: ${generatedCertId} sent to mail.` 
        });

    } catch (err) {
        console.error("Approve Route Error:", err);
        res.status(500).json({ success: false, message: "Approval process failed: " + err.message });
    }
});

// 3. Delete/Reject Request
router.delete('/reject/:id', authAdmin, async (req, res) => {
    try {
        await Certificate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Request deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Delete fail" });
    }
});

module.exports = router;