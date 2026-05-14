const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendCertificateMail, sendAdminNotification } = require('../utils/emailHelper');
const { generateCertificate } = require('../utils/pdfHelper');
const { authAdmin } = require('./certRoutes');
const path = require('path');

// 1. Get all pending requests for admin panel
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

        // --- MAVA IKKADA FIX CHEYYALI ---
        // Step 1: Custom Certificate ID generate cheyali
        const generatedCertId = `SD-${user._id.toString().slice(-6).toUpperCase()}`;
        
        // Step 2: Database lo certificateId field update chesi save cheyali
        user.certificateId = generatedCertId; 
        user.status = 'Approved';
        await user.save();

        // Step 3: PDF generate chey (Idi generatedCertId ni kooda vadukuntundi)
        const pdfFileName = await generateCertificate(user);
        
        // Step 4: Email pampadaniki path setup
        const fullPdfPath = path.join(__dirname, '../assets', pdfFileName);

        // Step 5: User ki mail pampu
        await sendCertificateMail(user.userEmail, fullPdfPath, user.userName);

        res.json({ 
            success: true, 
            message: "Approved mava! ID: " + generatedCertId + " saved and PDF sent." 
        });
    } catch (err) {
        console.error("Approve Error:", err);
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

// 4. Submit Payment Details (UTR)
router.post('/submit-payment', async (req, res) => {
    try {
        const { userId, utrNumber } = req.body;
        
        const user = await Certificate.findById(userId);
        if (!user) return res.status(404).json({ message: "User not Found!" });

        user.utrNumber = utrNumber;
        user.status = 'Payment Verified'; // Optional: Status update
        await user.save();

        await sendAdminNotification({
            userName: user.userName,
            userEmail: user.userEmail,
            utr: utrNumber
        });

        res.json({ success: true, message: "Payment details saved!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Payment submission failed!" });
    }
});

module.exports = router;