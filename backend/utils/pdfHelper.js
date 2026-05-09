const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Function: Generate Certificate PDF
 * Nee backend/assets/template.png paina details print chestundi
 */
const generateCertificate = async (userData) => {
    return new Promise((resolve, reject) => {
        try {
            // 1. Create PDF (Landscape for certificates)
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 0
            });

            // Path Setup: assets folder lo certificate save avtundi temporary ga
            const fileName = `Cert_${userData._id}.pdf`;
            const filePath = path.join(__dirname, '../assets', fileName);
            const templatePath = path.join(__dirname, '../assets/template.png');

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // 2. Add Background Template
            if (fs.existsSync(templatePath)) {
                doc.image(templatePath, 0, 0, { width: 841.89, height: 595.28 });
            } else {
                console.error("❌ Template image missing in backend/assets/template.png");
            }

            // 3. Add User Details (Positions nee template batti adjust chey mava)
            doc.fillColor('#1a1a1a'); // Dark color for text

            // User Name
            doc.fontSize(35).font('Helvetica-Bold')
               .text(userData.userName, 0, 270, { align: 'center' });

            // Course Details
            doc.fontSize(20).font('Helvetica')
               .text(`Successfully completed the ${userData.course} internship`, 0, 335, { align: 'center' });

            // College Name
            doc.fontSize(16).font('Helvetica-Oblique')
               .text(`at ${userData.collegeName}`, 0, 370, { align: 'center' });

            // Duration
            doc.fontSize(14).font('Helvetica')
               .text(`From: ${userData.duration}`, 0, 420, { align: 'center' });

            // Unique Certificate ID (Footer)
            const certID = `SD-${userData._id.toString().slice(-6).toUpperCase()}`;
            doc.fontSize(10).fillColor('#555')
               .text(`Verify at: skilldzire.com | ID: ${certID}`, 50, 540);

            doc.end();

            stream.on('finish', () => {
                console.log(`✅ PDF Generated: ${fileName}`);
                resolve(filePath);
            });

            stream.on('error', (err) => reject(err));

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };