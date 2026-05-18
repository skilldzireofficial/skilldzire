const nodemailer = require('nodemailer');

// Transporter Setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD  
    },
    tls: {
        rejectUnauthorized: false // Idi kachithamga undali mava
    },
    connectionTimeout: 15000 // 15 seconds wait chestundi
});

// User Request Submit chesinappudu Admin ki Alert
const sendAdminNotification = async (userData) => {
    const mailOptions = {
        from: `"SkillDzire System" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 New Internship Request: ${userData.userName}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2c3e50;">New Request Received Mava!</h2>
                <p><b>Name:</b> ${userData.userName}</p>
                <p><b>Course:</b> ${userData.course}</p>
                <p><b>UTR:</b> <span style="color:green; font-weight:bold;">${userData.utrNumber}</span></p>
                <hr>
                <p>Verify details in your dashboard:</p>
                <a href="https://skilldzire.onrender.com/admin" 
                   style="display: inline-block; padding: 10px 20px; background-color: #d63384; color: white; text-decoration: none; border-radius: 5px;">
                   Open Admin Panel
                </a>
            </div>`
    };
    return transporter.sendMail(mailOptions);
};

// Admin Approve kottinappudu User ki Certificate
const sendCertificateMail = async (userEmail, pdfPath, userName) => {
    const mailOptions = {
        from: `"SkillDzire Officials" <${process.env.ADMIN_EMAIL}>`,
        to: userEmail,
        subject: `Internship Completion Certificate - ${userName}`,
        html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
                <h2 style="color: #d63384;">Congratulations ${userName}!</h2>
                <p>We are delighted to inform you that you have successfully completed your internship with <b>SkillDzire</b>.</p>
                <p>Please find your official certificate attached below as a PDF.</p>
                <br>
                <p>Best Regards,<br><b>Team SkillDzire</b></p>
            </div>`,
        attachments: [
            {
                filename: `SkillDzire_${userName}_Certificate.pdf`,
                path: pdfPath
            }
        ]
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { sendAdminNotification, sendCertificateMail };