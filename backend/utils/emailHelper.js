const nodemailer = require('nodemailer');

// Render persistent production networks core config mava
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Port 465 explicit SSL socket connection layer
    pool: true,   // High alert: Keeps SMTP connections reuse parameters active to block ETIMEDOUT!
    maxConnections: 5,
    maxMessages: 100,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD  // NOTE: RENDER ENV PANEL LO SPACES KACHITHAMGA UNDAKOODADHU!
    },
    tls: {
        rejectUnauthorized: false // Strict local platform self-signed certificates fallback safe bypassing
    },
    connectionTimeout: 30000, // 30 seconds wait timeout limits
    greetingTimeout: 30000
});

// Transporter link runtime status verifying check engine
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mava! SMTP Server Connection Validation Failed:", error.message);
    } else {
        console.log("🚀 SMTP Engine configured successfully, ready to transmit mail channels!");
    }
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
                <p><b>UTR:</b> <span style="color:green; font-weight:bold;">${userData.utrNumber || 'N/A'}</span></p>
                <hr>
                <p>Verify details in your dashboard:</p>
                <a href="https://skilldzire.onrender.com/adminpage" 
                   style="display: inline-block; padding: 10px 20px; background-color: #d63384; color: white; text-decoration: none; border-radius: 5px;">
                   Open Admin Panel
                </a>
            </div>`
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Admin notification transmitted successfully:", info.messageId);
        return info;
    } catch (err) {
        console.error("❌ Admin Notification SMTP crash logged:", err.message);
        // Core architecture warning: Don't let route thread crash if mail fails mava
        throw err;
    }
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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Certificate attachment transmitted safely to: ${userEmail}`);
        return info;
    } catch (err) {
        console.error("❌ User Certificate transmission crash logged:", err.message);
        throw err;
    }
};

module.exports = { sendAdminNotification, sendCertificateMail };