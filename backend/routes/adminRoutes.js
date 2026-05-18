const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendCertificateMail, sendAdminNotification } = require('../utils/emailHelper');
const { generateCertificate } = require('../utils/pdfHelper');
const { authAdmin } = require('./certRoutes'); 
const path = require('path');

// 1. Get all pending requests
router.get('/pending', authAdmin, async (req, res) => {
    try {
        const pending = await Certificate.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: "Error on fetching requests!" });
    }
});

// 2. Approve and Send Certificate
router.post('/approve/:id', authAdmin, async (req, res) => {
    try {
        const user = await Certificate.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not Found!" });

        // Step 1: Certificate ID create chesi DB update cheyali
        const generatedCertId = `SD-${user._id.toString().slice(-6).toUpperCase()}`;
        user.certificateId = generatedCertId; 
        user.status = 'Approved';
        await user.save();

        // Step 2: PDF generate ayye varaku wait cheyali (Wait for full filePath)
        const fullPdfPath = await generateCertificate(user);

        // Step 3: Mail pampali
        await sendCertificateMail(user.userEmail, fullPdfPath, user.userName);

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