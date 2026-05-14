const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');

// 1. User Form Submit chesinapudu trigger avtundi
const nodemailer = require('nodemailer');

// User details save ayyaka neeku alert vachelaga

// 1. Updated Request Route with UTR and English Email Template
router.post('/request', async (req, res) => {
    try {
        const { userName, userEmail, course, utrNumber } = req.body;
        const newRequest = new Certificate({ ...req.body, status: 'Pending' });
        await newRequest.save();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_PASSWORD}
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

// 2. Protected Admin Route (Add the middleware here)


// 2. verifying user
// 2. verifying user status (Updated with Certificate ID)
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
            duration: user.duration // Schema nundi duration field
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- NEW: Verify by Certificate ID (For QR & Manual Search) ---
router.get('/verify/:id', async (req, res) => {
    try {
        // Database lo certificateId field tho search chestunnam
        const user = await Certificate.findOne({ certificateId: req.params.id });
        
        if (!user) {
            return res.status(404).json({ message: "No record Found with this Id" });
        }

        // Verification page ki kavalsina details pampali
        res.json({
            userName: user.userName,
            course: user.course,
            collegeName: user.collegeName,
            status: user.status
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error during verification" });
    }
});

// Middleware: Request header lo key unteనే allowed
const authAdmin = (req, res, next) => {
    const key = req.headers['x-admin-key'];
    if (key === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: Neeku access ledu mava!" });
    }
};

router.get('/admin/pending', authAdmin, async (req, res) => {
    try {
        const requests = await Certificate.find({ status: 'Pending' });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = {router, authAdmin};