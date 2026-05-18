const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

dotenv.config();
const app = express();

// 1. Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilldzire')
    .then(() => console.log('✅ MongoDB Connected successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. Static Files (Nee folder structure prakaram)
const frontendPath = path.resolve(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 4. API Routes
const { router: certRouter } = require('./routes/certRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Correct Prefixes
app.use('/api/cert', certRouter); 
app.use('/api/admin', adminRoutes);

// --- KEEP-ALIVE LOGIC ---
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

setInterval(() => {
    // Nee Render Link update chesa mava
    const backendUrl = 'http://localhost:5000/ping';
    axios.get(backendUrl)
        .then(() => console.log('Self-ping: Server is awake!'))
        .catch(err => console.error('Self-ping failed:', err.message));
}, 600000); 

// 5. Page Routing (Resoved Paths)
app.get('/homepage', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/verification', (req, res) => res.sendFile(path.join(frontendPath, 'verify.html')));
app.get('/checkstatus', (req, res) => res.sendFile(path.join(frontendPath, 'status.html')));
app.get('/adminpage', (req, res) => res.sendFile(path.join(frontendPath, 'admin.html')));
app.get('/paymentpage', (req, res) => res.sendFile(path.join(frontendPath, 'payment.html')));
app.get('/admin-login', (req, res) => res.sendFile(path.join(frontendPath, 'admin-login.html')));

// 6. Error Handling
app.use((req, res) => res.status(404).send('<h1>404 - Page Not Found!</h1>'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server active on port ${PORT}`);
});