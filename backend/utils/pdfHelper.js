const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateCertificate = async (userData) => {
    return new Promise(async (resolve, reject) => {
        const assetsDir = path.join(__dirname, '../assets');
        const fileName = `Cert_${userData._id}.pdf`;
        const filePath = path.join(assetsDir, fileName);
        const templatePath = path.join(assetsDir, 'template.png');

        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        try {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // 1. Load Background Canvas Template PNG Asset
            if (fs.existsSync(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 842, height: 595 });
            } else {
                console.warn("Mava, template.png not found in assets folder!");
            }

            // =========================================================
            // 🎯 FIXED CO-ORDINATES PIXEL INTEGRATION SYSTEM (9 STEPS)
            // =========================================================

            // --- STEP 1: User Name (Perfect row spacing on line 1) ---
            const nameStr = userData.userName || "GUNUKULA RAKESH";
            doc.fillColor('#1a1a1a')
               .fontSize(20)
               .font('Helvetica-Bold')
               .text(nameStr.toUpperCase(), 0, 185, { align: 'center', width: 842 });

            // --- STEP 2: Enrolled in the [Branch & Roll No] ---
            const branchText = `${userData.branch || "CSE Data Science"} - ${userData.rollNo || "23F05A4404"}`;
            doc.fontSize(13)
               .font('Helvetica-Bold')
               .fillColor('#2d3748')
               .text(branchText, 305, 230, { width: 450, align: 'left' });

            // --- STEP 3: From College [College Name] ---
            const collegeName = userData.collegeName || "St. Ann's College of Engineering & Technology";
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#2d3748')
               .text(collegeName, 295, 256, { width: 480, align: 'left' });

            // --- STEP 4: of university [JNTUK, Kakinada] ---
            doc.fontSize(13)
               .font('Helvetica-Bold')
               .fillColor('#2d3748')
               .text("JNTUK, Kakinada", 285, 281, { width: 400, align: 'left' });

            // --- STEP 5: Domain Name (Below Long-term Internship titled) ---
            const domainName = userData.course || "Automation Testing"; 
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(domainName, 0, 335, { align: 'center', width: 842 });

            // --- STEP 6: Internship Duration (Under SkillDzire from _________ to _________) ---
            const fromDate = userData.internshipFrom || "15-Mar-2026";
            const toDate = userData.internshipTo || "15-May-2026";
            
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#2d3748');
            doc.text(fromDate, 325, 386, { width: 110, align: 'center' });
            doc.text(toDate, 470, 386, { width: 110, align: 'center' });

            // --- STEP 7: Certificate ID (Next to 'Certificate ID: SDST-') ---
            const generatedIdTail = userData.certificateId || userData._id.toString().slice(-6).toUpperCase();
            const certID = `SDST-${generatedIdTail}`;
            
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(certID, 290, 462, { width: 200, align: 'left' });

            // --- STEP 8: Issued On Date (Next to 'Issued On:') ---
            const issuedOnDate = userData.issuedOn || "18-Mar-2026";
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor('#1a1a1a')
               .text(issuedOnDate, 255, 493, { width: 150, align: 'left' });

            // --- STEP 9: QR Code Generation & Middle White Area Placement ---
            const verifyURL = `https://skilldzire.onrender.com/verification?id=${certID}`;
            
            const qrBuffer = await QRCode.toBuffer(verifyURL, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 90,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            // Position adjusted to fit perfectly in the open center blank region
            doc.image(qrBuffer, 515, 440, { width: 68, height: 68 });

            doc.end();

            stream.on('finish', () => {
                console.log("PDF Co-ordinates standard fixed successfully mava!");
                resolve(filePath); 
            });
            
            stream.on('error', (err) => {
                console.error("PDF Stream Error mava:", err);
                reject(err);
            });

        } catch (error) {
            console.error("PDF Catch Error mava:", error);
            reject(error);
        }
    });
};

module.exports = { generateCertificate };