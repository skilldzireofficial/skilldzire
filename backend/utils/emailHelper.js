const nodemailer = require('nodemailer');
const brevoTransport = require('nodemailer-brevo-transport');
const dns = require('dns');

// Force DNS lookup engine configuration systems to look for IPv4 maps first
dns.setDefaultResultOrder('ipv4first');

/**
 * 💡 MAVA NOTE: Nodemailer wrapper pipeline framework run avvadaniki 
 * Standard Brevo plugin connector engine configure chesam!
 * RENDER PANEL ROUTING VALUES:
 * 1. ADMIN_EMAIL -> Nee official master Admin email configuration ID.
 * 2. ADMIN_PASSWORD -> Gmail application pass key kaadhu mava! Brevo account v3 API Key paste cheyali.
 */
const transporter = nodemailer.createTransport(
    new brevoTransport({
        apiKey: process.env.ADMIN_PASSWORD // Maps securely to your active Brevo Web Key mava!
    })
);

// Runtime verification handler sequence setup check logic
transporter.verify((error, success) => {
    if (error) {
        console.warn("⚠️ Nodemailer verification block skipped for API integration channels layout framework.");
    } else {
        console.log("🚀 Nodemailer API Transport Link Connected Successfully!");
    }
});

// User Request Submit chesinappudu Admin ki Alert
const sendAdminNotification = async (userData) => {
    try {
        const mailOptions = {
            from: `"SkillDzire System" <${process.env.ADMIN_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🔔 New Internship Request: ${userData.userName}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2c3e50;">New Request Received Mava!</h2>
                    <p><b>Name:</b> ${userData.userName}</p>
                    <p><b>Email:</b> ${userData.userEmail || 'N/A'}</p>
                    <p><b>Course:</b> ${userData.course}</p>
                    <p><b>UTR:</b> <span style="color:green; font-weight:bold;">${userData.utrNumber || 'N/A'}</span></p>
                    <hr>
                    <p>Verify details inside your administration dashboard panel:</p>
                    <a href="https://skilldzire.onrender.com/adminpage" 
                       style="display: inline-block; padding: 10px 20px; background-color: #d63384; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Open Admin Panel
                    </a>
                </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Admin alert notification generated and dispatched safely, ID:", info.messageId || info.id);
        return true;
    } catch (err) {
        console.error("❌ Admin alert notification engine failure log:", err.message);
        throw err;
    }
};

// Admin Approve kottinappudu User ki Certificate
const sendCertificateMail = async (userEmail, pdfPath, userName) => {
    try {
        const mailOptions = {
            from: `"SkillDzire Officials" <${process.env.ADMIN_EMAIL}>`,
            to: userEmail,
            subject: `Internship Completion Certificate - ${userName}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; padding: 20px; border: 1px solid #f9f9f9;">
                    <h2 style="color: #d63384;">Congratulations ${userName}!</h2>
                    <p>We are delighted to inform you that you have successfully completed your professional internship with <b>SkillDzire</b>.</p>
                    <p>Please find your official validation completion certificate attached below as a high-resolution PDF document.</p>
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

        const info = await transporter.sendMail(mailOptions);
        console.log(`🚀 Certificate mail successfully routed down to user mailbox [${userEmail}]`);
        return true;
    } catch (err) {
        console.error("❌ Student certificate delivery track crash trace:", err.message);
        throw err;
    }
};

module.exports = { sendAdminNotification, sendCertificateMail };