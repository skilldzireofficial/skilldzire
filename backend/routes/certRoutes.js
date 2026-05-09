const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { sendAdminNotification } = require('../utils/emailHelper');

// 1. User Form Submit chesinapudu trigger avtundi
const nodemailer = require('nodemailer');

// User details save ayyaka neeku alert vachelaga
router.post('/request', async (req, res) => {
    try {
        const newRequest = new Certificate({ ...req.body, status: 'Pending' });
        await newRequest.save();

        // --- Start: Admin Alert Logic ---
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_PASSWORD }
        });

        const adminMailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: process.env.ADMIN_EMAIL, 
            subject: `🚨 Payment Alert: ${req.body.userName}`,
            html: `<h3>New Certificate Request</h3>
                   <p><b>Name:</b> ${req.body.userName}</p>
                   <p><b>Email:</b> ${req.body.userEmail}</p>
                   <p><a href="http://localhost:5000/admin.html">Click here to Approve in Admin Panel</a></p>`
        };
        await transporter.sendMail(adminMailOptions);
        // --- End: Admin Alert Logic ---

        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. verifying user
router.get('/status/:email', async (req, res) => {
    try {
        const user = await Certificate.findOne({ userEmail: req.params.email }).sort({ createdAt: -1 });
        if (!user) {
            return res.status(404).json({ message: "No Record Found" });
        }
        res.json({ 
            status: user.status, 
            name: user.userName,
            course: user.course 
        });
    } catch (err) {
        res.status(500).json({ message: "Status fetch error!" });
    }
});

module.exports = router;