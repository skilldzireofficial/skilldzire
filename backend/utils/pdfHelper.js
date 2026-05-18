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
        const templatePath = path.join(assetsDir, 'template.png');

        // Folder lekapothe create chestundi
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        try {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // 1. Template Background
            if (fs.existsSync(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 842, height: 595 });
            } else {
                console.warn("Mava, template.png not found in assets!");
            }

            // 2. Name & Course
            doc.fillColor('#1a1a1a').fontSize(38).font('Helvetica-Bold')
               .text(userData.userName.toUpperCase(), 0, 275, { align: 'center' });

            doc.fontSize(22).font('Helvetica-Bold')
               .text(userData.course, 0, 355, { align: 'center' });

            // 3. QR Code & Cert ID
            const certID = `SD-${userData._id.toString().slice(-6).toUpperCase()}`;
            // Render lo verification url ki id pass chesthunnam
            const verifyURL = `https://skilldzire.onrender.com/verification?id=${certID}`;
            const qrCodeData = await QRCode.toDataURL(verifyURL);
            
            doc.image(qrCodeData, 380, 440, { width: 85, height: 85 });

            doc.fontSize(12).font('Helvetica-Bold').fillColor('#d63384')
               .text(certID, 185, 518);

            doc.end();

            // FIX: Stream poorthi ayyaka full filePath pampali
            stream.on('finish', () => {
                console.log("PDF Generated successfully mava!");
                resolve(filePath); 
            });
            
            stream.on('error', (err) => {
                console.error("PDF Stream Error:", err);
                reject(err);
            });

        } catch (error) {
            console.error("PDF Catch Error:", error);
            reject(error);
        }
    });
};

module.exports = { generateCertificate };