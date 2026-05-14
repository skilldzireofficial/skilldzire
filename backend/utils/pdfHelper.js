const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode'); // Mava idi install chey (npm i qrcode)

/**
 * Function: Generate Certificate PDF
 * Backend assets folder lo template.png paina details print chestundi
 */
const generateCertificate = async (userData) => {
    return new Promise(async (resolve, reject) => {
        // 1. Setup Paths
        const assetsDir = path.join(__dirname, '../assets');
        const fileName = `Cert_${userData._id}.pdf`;
        const filePath = path.join(assetsDir, fileName);
        const templatePath = path.join(assetsDir, 'template.png');

        // Assets folder lekapothe create chey mava (ENOENT error rakunda)
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        // Mava ikkada 'let' vaadi stream ni bayata declare chesthe catch block lo access untundi
        let stream;

        try {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
            stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // 2. Background Template
            if (fs.existsSync(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 842, height: 595 });
            } else {
                console.error("Mava, assets folder lo template.png ledu!");
            }

            // 3. USER NAME (Bold & Center)
            doc.fillColor('#1a1a1a')
               .fontSize(38)
               .font('Helvetica-Bold')
               .text(userData.userName.toUpperCase(), 0, 275, { align: 'center' });

            // 4. COURSE DETAILS
            doc.fontSize(22)
               .font('Helvetica-Bold')
               .text(userData.course, 0, 355, { align: 'center' });

            // 5. QR CODE Logic
            const certID = `SD-${userData._id.toString().slice(-6).toUpperCase()}`;
            const verifyURL = `http://localhost:5000/verification?id=${certID}`;
            const qrCodeData = await QRCode.toDataURL(verifyURL);
            
            // QR Code placement
            doc.image(qrCodeData, 380, 440, { width: 85, height: 85 });

            // 6. CERTIFICATE ID Print
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#d63384')
               .text(certID, 185, 518); 

            doc.end();

            // Success handling
            stream.on('finish', () => {
                resolve(fileName);
            });

            // Stream Error handling
            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            console.error("PDF Logic Error:", error);
            // Ikkada check chesi stream close chesthe ReferenceError raadu
            if (stream) {
                stream.end();
            }
            reject(error);
        }
    });
};

module.exports = { generateCertificate };