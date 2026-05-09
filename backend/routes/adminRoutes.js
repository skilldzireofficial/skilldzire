const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendCertificateMail, sendAdminNotification } = require('../utils/emailHelper');
const { generateCertificate } = require('../utils/pdfHelper');

// 1. Get all pending requests for admin panel
router.get('/pending', async (req, res) => {
    try {
        const pending = await Certificate.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (err) {
        res.status(500).json({ message: "Error on fetching requests!" });
    }
});

// 2. Approve and Send Certificate
router.post('/approve/:id', async (req, res) => {
    try {
        const user = await Certificate.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not Found!" });

        // Update status in DB
        user.status = 'Approved';
        await user.save();

        // Step A: Generate PDF
        const pdfPath = await generateCertificate(user);

        // Step B: Send to User from skilldzire@gmail.com
        await sendCertificateMail(user.userEmail, pdfPath, user.userName);

        res.json({ success: true, message: "Approved!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Approval process failed!" });
    }
});

// 3. Delete/Reject Request
router.delete('/reject/:id', async (req, res) => {
    try {
        await Certificate.findByIdAndDelete(req.params.id);
        res.json({ message: "Request deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete fail" });
    }
});

module.exports = router;