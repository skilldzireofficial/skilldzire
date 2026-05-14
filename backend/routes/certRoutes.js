const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');
const nodemailer = require('nodemailer');

// 1. User Form Submit (Request Route)
router.post('/request', async (req, res) => {
    try {
        const { userName, userEmail, course, utrNumber } = req.body;
        // Kotha request save chestunnam
        const newRequest = new Certificate({ ...req.body, status: 'Pending' });
        await newRequest.save();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { 
                user: process.env.ADMIN_EMAIL, 
                pass: process.env.ADMIN_PASSWORD 
            }
        });

        const adminMailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: process.env.ADMIN_EMAIL, 
            subject: `Payment Alert: ${userName}`,
            html: `
                <h3>New Certificate Request</h3>
                <p><b>Name:</b> ${userName}</p>
                <p><b>Email:</b> ${userEmail}</p>
                <p><b>Course:</b> ${course}</p>
                <p><b>UTR Number:</b> <span style="color:green; font-weight:bold;">${utrNumber}</span></p>
                <br>
                <p>
                    <a href="http://localhost:5000/admin-login" 
                       style="padding: 10px 20px; background: #FF6600; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Verify in Admin Panel
                    </a>
                </p>`
        };

        await transporter.sendMail(adminMailOptions);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. User Status Check (Email tho verify cheyadaniki)
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

// 3. MAIN VERIFICATION: Certificate ID tho vethukuthunnam
// QR code scan chesina, verify.html lo ID enter chesina ide trigger avtundi
router.get('/verify/:id', async (req, res) => {
    try {
        // Database lo certificateId field check chestundi
        const cert = await Certificate.findOne({ certificateId: req.params.id });

        if (!cert) {
            // Mava, record lekapothe 404 isthunnam
            return res.status(404).json({ success: false, message: "Invalid ID, records not found!" });
        }

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

// 4. Middleware: Admin Authentication
const authAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Neeku access ledu mava!" });
    }
};

// Admin pending requests fetch cheyadaniki
router.get('/admin/pending', authAdmin, async (req, res) => {
    try {
        const requests = await Certificate.find({ status: 'Pending' });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mava, exporting correctly now
module.exports = { router, authAdmin };