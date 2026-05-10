const nodemailer = require('nodemailer');
const path = require('path');

// 1. Transporter Setup (Nee skilldzire@gmail.com credentials tho)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL, // skilldzire@gmail.com
        pass: process.env.ADMIN_PASSWORD  // Nee 16-digit App Password
    }
});

/**
 * 2. Function: Send Admin Notification
 * User form submit cheyagane neeku (Admin) mail vasthundi.
 */
const sendAdminNotification = async (userData) => {
    const mailOptions = {
        from: `"SkillDzire System" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL, // Deenike alert vastundi
        subject: `🔔 New Internship Request: ${userData.userName}`,
        html: `
            <div style="font-family: sans-serif; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2c3e50;">New Request Received Mava!</h2>
                <p><b>Candidate Name:</b> ${userData.userName}</p>
                <p><b>Course:</b> ${userData.course}</p>
                <p><b>College:</b> ${userData.collegeName}</p>
                <p><b>Duration:</b> ${userData.duration}</p>
                <p><b>Email:</b> ${userData.userEmail}</p>
                <hr>
                <p>Verify payment and approve the certificate from your dashboard:</p>
                <a href="https://skilldzire.render.com/admin.html" 
                   style="display: inline-block; padding: 12px 25px; background-color: #d63384; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Open Admin Panel
                </a>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * 3. Function: Send Certificate to User
 * Admin approve nokkagane, user ki PDF attach ayyi mail velthundi.
 */
const sendCertificateMail = async (userEmail, pdfPath, userName) => {
    const mailOptions = {
        from: `"SkillDzire Officials" <${process.env.ADMIN_EMAIL}>`,
        to: userEmail,
        subject: `Internship Completion Certificate - ${userName}`,
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #d63384;">Congratulations ${userName}!</h2>
                <p>We are delighted to inform you that you have successfully completed your internship with <b>SkillDzire</b>.</p>
                <p>Your commitment and performance during the program were exceptional. As a token of appreciation, we are issuing your official certificate.</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #d63384;">
                    <p style="margin: 0;"><b>How to get your certificate:</b></p>
                    <p style="margin: 5px 0;">Please find the attached PDF file below. You can view it and <b>Download</b> it for your future career records.</p>
                </div>

                <p>Wishing you a very bright career ahead!</p>
                <br>
                <p>Best Regards,<br>
                <b>Team SkillDzire</b><br>
                <small>skilldzire.official@gmail.com</small></p>
            </div>
        `,
        attachments: [
            {
                filename: `SkillDzire_${userName}_Certificate.pdf`,
                path: pdfPath // PDF generate ayyi unna path
            }
        ]
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendAdminNotification, sendCertificateMail };