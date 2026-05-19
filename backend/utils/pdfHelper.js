const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateCertificate = async (userData) => {
    return new Promise(async (resolve, reject) => {
        const assetsDir = path.join(__dirname, '../assets');
        const fileName = `Cert_${userData._id}.pdf`;
        const filePath = path.join(assetsDir, fileName);
        const templatePath = path.join(assetsDir, 'template.jpg');

        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        try {
            // 🔥 Document size ni dynamic canvas values thoti initialize chesa mava!
            const doc = new PDFDocument({ 
                size: [2048, 1463], 
                margin: 0 
            });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Background image mapping exact bounds pixels frame
            if (fs.existsSync(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 2048, height: 1463 });
            } else {
                console.warn("Sorry!,template.jpg missing inside assets directory path!");
            }

            // =================================================================
            // 🎯 DYNAMIC DATE PARSING & BEAUTIFIER ENGINE
            // =================================================================
            let fromDateStr = "23-Sep-2025"; // Fallbacks if empty
            let toDateStr = "20-Mar-2026";

            // 1. Database lone duration string ("startDate to endDate") ni split chesthunnam
            if (userData.duration && userData.duration.includes(' to ')) {
                const parts = userData.duration.split(' to ');
                if (parts[0]) fromDateStr = parts[0].trim();
                if (parts[1]) toDateStr = parts[1].trim();
            } else {
                // Incase patha data fields emైనా unte safe back check mava
                if (userData.internshipFrom) fromDateStr = userData.internshipFrom;
                if (userData.internshipTo) toDateStr = userData.internshipTo;
            }

            // 2. Formatter Helper: HTML raw text date ni '10-May-2026' style loki custom convert chesthundi mava
            const formatCertificateDate = (rawDateStr) => {
                const parsedDate = new Date(rawDateStr);
                if (!isNaN(parsedDate.getTime())) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return parsedDate.toLocaleDateString('en-GB', options).replace(/ /g, '-'); 
                }
                return rawDateStr; // Incase string directly format lo unte text direct transfer kuthundi
            };

            // 3. Modifying all 3 variables into strict dynamic format pointers
            const finalFromDate = formatCertificateDate(fromDateStr);
            const finalToDate = formatCertificateDate(toDateStr);
            const finalIssuedOn = formatCertificateDate(toDateStr); // End date scale e Issued On date ki lock mava!

            // =================================================================
            // 🎯 VECTOR PIXEL-PERFECT EXACT CO-ORDINATES FOR 2048 x 1463 SCALE
            // =================================================================

            // --- STEP 1: User Name (On the black blank line right next to 'Mr./Ms') ---
            const nameStr = userData.userName;
            doc.fillColor('#1a1a1a')
               .fontSize(40) // Large resolution match
               .font('Helvetica-Bold')
               .text(nameStr.toUpperCase(), 0, 534, { width: 2048, align: 'center' });

            // --- STEP 2: Enrolled in the [Branch & Roll No] ---
            const branchText = `${userData.branchRoll || "CSE - Data Science - 23F05A4404"}`;
            doc.fontSize(38)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(branchText, 0, 620, { width: 2048, align: 'center' });

            // --- STEP 3: From College [College Name] ---
            const collegeName = userData.collegeName || "St. Ann's College of Engineering & Technology";
            doc.fontSize(36)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(collegeName, 50, 696, { width: 2048, align: 'center' });

            // --- STEP 4: of university [JNTUK, Kakinada] ---
            doc.fontSize(36)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text("JNTUK, Kakinada", 0, 788, { width: 2048, align: 'center' });

            // --- STEP 5: Domain Name (Below Internship title text marker) ---
            const domainName = userData.course;
            doc.fontSize(40)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(domainName, 0, 960, { align: 'center', width: 2048 });

            // --- STEP 6: Internship Duration (Under SkillDzire from _________ to _________) ---
            // 🔥 FIX: Nuvvu set cheskunna exact layout points coordinate lines alignment (780 and 1112) direct integration mava!
            doc.fontSize(36).font('Helvetica-Bold').fillColor('#1a1a1a');
            doc.text(finalFromDate, 780, 1077, { width: 300, align: 'center' });
            doc.text(finalToDate, 1112, 1077, { width: 300, align: 'center' });

            // --- STEP 7: Certificate ID (Next to 'Certificate ID: SDST-') ---
            const certID = userData.certificateId || `SDST-25-28365`;
            const finalDisplayID = certID.startsWith('SDST-') ? certID.replace('SDST-', '').trim() : certID;

            doc.fontSize(36)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(finalDisplayID, 580, 1250, { width: 2048, align: 'left' });

            // --- STEP 8: Issued On Date ---
            // 🔥 FIX: Static numbers teesi mana formatted end date variable ని కూర్చోబెట్టాం mava!
            doc.fontSize(32)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(finalIssuedOn, 530, 1320, { width: 2048, align: 'left' });

            // --- STEP 9: QR Code Generation & Exact Center High-Res Scaling ---
            const verifyURL = `https://skilldzire.onrender.com/verification?id=${certID}`;
            
            const qrBuffer = await QRCode.toBuffer(verifyURL, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 200, 
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            // Perfectly balanced in the mid gap area using the true coordinates logic
            doc.image(qrBuffer, 1000, 1190, { width: 165, height: 165 });

            doc.end();

            stream.on('finish', () => {
                console.log("✅ PDF generated flawlessly with dynamic formatted dates mava!");
                resolve(filePath); 
            });
            
            stream.on('error', (err) => {
                console.error("❌ PDF Stream Error:", err);
                reject(err);
            });

        } catch (error) {
            console.error("❌ PDF Catch Error:", error);
            reject(error);
        }
    });
};

module.exports = { generateCertificate };