const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();

// 1. Middleware
app.use(cors()); // CORS issue rakunda idi chala important mava
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilldzire')
    .then(() => console.log('✅ MongoDB Connected successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. Serve Static Files
// Frontend files (HTML, CSS, JS) anni access avvadaniki idi kavali
app.use(express.static(path.join(__dirname, '../frontend')));

// Backend assets (Templates & Generated PDFs) access avvadaniki
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 4. API Routes
// Ikkada nuvvu icche prefix '/api/cert' chala important
app.use('/api/cert', require('./routes/certRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));


// 1. Cron-job.org kosam simple route
app.get('/ping', (req, res) => {
    console.log("Ping received at:", new Date().toLocaleTimeString());
    res.status(200).send('pong');
});

// 2. Self-ping interval (Every 10 mins)
setInterval(() => {
    // Render backend URL ikkada update chey mava
    const backendUrl = 'http://localhost:5000/ping';
    axios.get(backendUrl)
        .then(() => console.log('Self-ping: Server is awake!'))
        .catch(err => console.log('Self-ping failed:', err.message));
}, 600000); 
// --- KEEP-ALIVE PING LOGIC END ---

// 5. Default Route - Redirect to Homepage
app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/verification', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/verify.html'))
})

app.get('/checkstatus', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/status.html'))
})

app.get('/adminpage', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'))
})

app.get('/paymentpage', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/payment.html'))
})



app.get('/admin-login', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-login.html'))
})


// 6. Error Handling for undefined routes
app.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found!</h1>');
});

// Port Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
});