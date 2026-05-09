let selectedApp = 'phonepe';
const upiId = "6305358073@ybl"; // Nee UPI ID mava
const amount = "1";
const payeeName = "SkillDzire";

function selectMethod(element, method) {
    document.querySelectorAll('.upi-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    selectedApp = method;
}


function handlePayment() {
    const note = "Internship Certificate Fee";
    const upiUri = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Check if Mobile or Laptop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Mobile: App trigger chesthunnam
        window.location.href = upiUri;
    } else {
        // Laptop: QR Code modal chupisthunnam
        const qrImg = document.getElementById('qrImg');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
        document.getElementById('qrModal').style.display = 'flex';
    }
}

async function notifyAdmin() {
    const data = JSON.parse(sessionStorage.getItem('pendingCertData'));

    if (!data) {
        alert("Session expired. Please fill the form again mava!");
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/cert/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById('successModal').style.display = 'flex';
            sessionStorage.removeItem('pendingCertData');
        }
    } catch (err) {
        alert("Server Down! Check if backend is running.");
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Function to open the UTR modal
function openUTRModal() {
    document.getElementById('utrModal').style.display = 'flex';
}

// Function to close the UTR modal
function closeUTRModal() {
    document.getElementById('utrModal').style.display = 'none';
}

async function processUTRSubmission() {
    const utrField = document.getElementById('utrNumber');
    const confirmBtn = document.getElementById('confirmBtn');
    const utrValue = utrField.value.trim();
    const userId = localStorage.getItem('userId'); // Register ayinappudu save chesina ID

    // Professional Validation (12 Digits check)
    if (!/^\d{12}$/.test(utrValue)) {
        alert("Invalid Transaction ID. Please provide the 12-digit UTR number.");
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = "Processing...";

    try {
        const response = await fetch('https://skilldzire.onrender.com/api/submit-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, utrNumber: utrValue })
        });

        if (response.ok) {
            alert("Verification details sent to administrator. Please allow 3-4 hours for processing.");
            window.location.href = "status.html"; // Status check cheskovadaniki redirect
        } else {
            alert("Submission failed. Please verify your connection and try again.");
            confirmBtn.disabled = false;
            confirmBtn.innerText = "Verify Submission";
        }
    } catch (error) {
        alert("Server connection error. Please try again later.");
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Verify Submission";
    }
}

async function processUTRSubmission() {
    const utrField = document.getElementById('utrNumber');
    const confirmBtn = document.getElementById('confirmBtn');
    const utrValue = utrField.value.trim();
    const userId = localStorage.getItem('userId');

    // Verification 1: Check if UTR is exactly 12 digits
    if (!/^\d{12}$/.test(utrValue)) {
        alert("Invalid Transaction ID. Please enter the correct 12-digit UTR number.");
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = "Submitting...";

    try {
        const response = await fetch('https://skilldzire.onrender.com/api/submit-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, utrNumber: utrValue })
        });

        if (response.ok) {
            // Success Modal Trigger
            document.getElementById('utrModal').style.display = 'none';
            alert("Payment details submitted successfully. Our team will verify the transaction within 3-4 hours.");
            window.location.href = "status.html";
        } else {
            alert("An error occurred during submission. Please try again.");
            confirmBtn.disabled = false;
            confirmBtn.innerText = "Verify Submission";
        }
    } catch (error) {
        alert("Unable to connect to the server. Please check your internet connection.");
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Verify Submission";
    }
}