const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js runtime engine to execute network handshakes using IPv4 maps first
dns.setDefaultResultOrder('ipv4first');

/**
 * 💡 MAVA NOTE: Render custom setups lo GMail DNS checks network maps dynamic loop errors ivvakunda,
 * Direct Google core SMTP secure tunnel port configuration bind chesi transporter lock chesa mava!
 */
const transporter = nodemailer.createTransport({
    host: '74.125.20.108', // Direct Google SMTP Secured IPv4 Pipeline Bypass Target
    port: 465,             // Pure SSL protocol engine
    secure: true,          // Force SSL handshakes loop active
    pool: true,            // Keeps internal cloud connections alive
    maxConnections: 5,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD  // Ensure zero spaces inside Render settings variable config panel mava!
    },
    tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' // Explicit server metadata matching to clear SSL checks
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
});

// Verification check logging block
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mava! SMTP Core Over IPv4 Tunnel Binding Failed:", error.message);
    } else {
        console.log("🚀 Forced IPv4 SMTP Engine Active & Tunnel Verification Success!");
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
                    <p><b>Course:</b> ${userData.course}</p>
                    <p><b>UTR:</b> <span style="color:green; font-weight:bold;">${userData.utrNumber || 'N/A'}</span></p>
                    <hr>
                    <p>Verify details inside your administration dashboard:</p>
                    <a href="https://skilldzire.onrender.com/adminpage" 
                       style="display: inline-block; padding: 10px 20px; background-color: #d63384; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Open Admin Panel
                    </a>
                </div>`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Admin alert dispatch log confirmation code index:", info.messageId);
        return true;
    } catch (err) {
        console.error("❌ Admin system alert transmission fault:", err.message);
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
                    <p>We are delighted to inform you that you have successfully completed your internship with <b>SkillDzire</b>.</p>
                    <p>Please find your official completion certificate safely attached below as a high-resolution PDF document.</p>
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
        console.log(`🚀 Certificate mail safely beamed down to student inbox: ${userEmail}, Id: ${info.messageId}`);
        return true;
    } catch (err) {
        console.error("❌ Student certificate delivery track crashed:", err.message);
        throw err;
    }
};

module.exports = { sendAdminNotification, sendCertificateMail };