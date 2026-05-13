const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Function: Generate Certificate PDF
 * Nee backend/assets/template.png paina details print chestundi
 */
const QRCode = require('qrcode'); // Mava idi install chey (npm i qrcode)

const generateCertificate = async (userData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
            const fileName = `Cert_${userData._id}.pdf`;
            const filePath = path.join(__dirname, '../assets', fileName);
            const templatePath = path.join(__dirname, '../assets/template.png');

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // 1. Template Image (Base)
            if (fs.existsSync(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 841.89, height: 595.28 });
            }

            // 2. --- USER NAME (Bold & Center) ---
            // Font size 38 petti Helvetica-Bold vadutunnam mava
            doc.fillColor('#1a1a1a')
               .fontSize(38)
               .font('Helvetica-Bold')
               .text(userData.userName.toUpperCase(), 0, 275, { align: 'center' });

            // 3. --- COURSE DETAILS (Bold) ---
            doc.fontSize(22)
               .font('Helvetica-Bold')
               .text(userData.course, 0, 355, { align: 'center' });

            // 4. --- QR CODE (Center Placement) ---
            // Nuvvu annattu QR Code center lo ravali ante X position ni sagam lo set cheyali
            const certID = `SD-${userData._id.toString().slice(-6).toUpperCase()}`;
            const verifyURL = `http://localhost:5000/verify.html?id=${certID}`;
            const qrCodeData = await QRCode.toDataURL(verifyURL);
            
            // X=380 (Center of A4 Landscape), Y=440 (Bottom section)
            doc.image(qrCodeData, 380, 440, { width: 85, height: 85 });

            // 5. --- CERTIFICATE ID (Bold & Left) ---
            // "Certificate ID:" label pakkana exact ga ravali
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#d63384') // Highlight color
               .text(certID, 185, 518); 

            doc.end();
            stream.on('finish', () => resolve(fileName));
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };