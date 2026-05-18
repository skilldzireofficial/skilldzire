const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateCertificate = async (userData) => {
    return new Promise(async (resolve, reject) => {
        // Path resolution for Render and Localhost
        const assetsDir = path.join(__dirname, '../assets');
        const fileName = `Cert_${userData._id}.pdf`;
        const filePath = path.join(assetsDir, fileName);
        
        // 🔥 Mava, set to template.png explicitly as per your asset format
        const templatePath = path.join(assetsDir, 'template.png');

        // Folder lekapothe create chestundi
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        try {
            // A4 Landscape standard matrix grid bounds (842 x 595 Pixels)
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
            // 🎯 REAL-TIME PIXEL MATCHING DYNAMIC OVERLAY (9 STEPS)
            // =========================================================

            // --- STEP 1: User Name (On the black blank line below 'This is to Certify that Mr./Ms') ---
            const nameStr = userData.userName || "GUNUKULA RAKESH";
            doc.fillColor('#1a1a1a')
               .fontSize(22)
               .font('Helvetica-Bold')
               .text(nameStr.toUpperCase(), 0, 240, { align: 'center', width: 842 });

            // --- STEP 2: Enrolled in the [Branch & Roll No] ---
            const branchText = `${userData.branch || "CSE Data Science"} - ${userData.rollNo || "23F05A4404"}`;
            doc.fontSize(14)
               .font('Helvetica-BoldOblique')
               .fillColor('#222222')
               .text(branchText, 310, 273, { width: 450, align: 'left' });

            // --- STEP 3: From College [College Name] ---
            const collegeName = userData.collegeName || "St. Ann's College of Engineering & Technology";
            doc.fontSize(13)
               .font('Helvetica-Bold')
               .fillColor('#111111')
               .text(collegeName, 295, 293, { width: 480, align: 'left' });

            // --- STEP 4: of university [JNTUK, Kakinada] ---
            doc.fontSize(14)
               .font('Helvetica-BoldOblique')
               .fillColor('#222222')
               .text("JNTUK, Kakinada", 320, 315, { width: 400, align: 'left' });

            // --- STEP 5: Domain Name (Below 'Successfully Completed Long-term Internship programme titled') ---
            const domainName = userData.course || "Automation Testing"; 
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(domainName, 0, 368, { align: 'center', width: 842 });

            // --- STEP 6: Internship Duration (Under SkillDzire from _________ to _________) ---
            const fromDate = userData.internshipFrom || "15-Mar-2026";
            const toDate = userData.internshipTo || "15-May-2026";
            
            doc.fontSize(13).font('Helvetica-Bold').fillColor('#222222');
            doc.text(fromDate, 345, 401, { width: 110, align: 'center' });
            doc.text(toDate, 495, 401, { width: 110, align: 'center' });

            // --- STEP 7: Certificate ID (Next to 'Certificate ID: SDST-') ---
            const generatedIdTail = userData.certificateId || userData._id.toString().slice(-5).toUpperCase();
            const certID = `SDST-${generatedIdTail}`;
            
            doc.fontSize(12)
               .font('Helvetica-BoldOblique')
               .fillColor('#000000')
               .text(certID, 185, 477, { width: 200, align: 'left' });

            // --- STEP 8: Issued On Date (Next to 'Issued On:') ---
            const issuedOnDate = userData.issuedOn || "18-Mar-2026";
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#000000')
               .text(issuedOnDate, 265, 497, { width: 150, align: 'left' });

            // --- STEP 9: QR Code Generation & Exact Center Grid Placement ---
            const verifyURL = `https://skilldzire.onrender.com/verification?id=${certID}`;
            
            // Raw binary stream generation using high error correction density
            const qrBuffer = await QRCode.toBuffer(verifyURL, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 90,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            // Exact center horizontal alignment on standard certificate layout
            doc.image(qrBuffer, 465, 465, { width: 68, height: 68 });

            // Finalize execution context streams
            doc.end();

            // Stream buffer full tracking finish logic
            stream.on('finish', () => {
                console.log("PDF Generated successfully mava!");
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