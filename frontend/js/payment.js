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
        const response = await fetch('https://skilldzire.onrender.com/api/cert/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...data, utrNumber: utrValue})
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
    
    // Retrieve the form data stored in sessionStorage from main.js
    const userData = JSON.parse(sessionStorage.getItem('pendingCertData')); 

    // Validation for 12-digit UTR
    if (!/^\d{12}$/.test(utrValue)) {
        alert("Please enter a valid 12-digit UTR number.");
        return;
    }

    if (!userData) {
        alert("Session expired. Please fill the form again.");
        window.location.href = '/';
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = "Submitting...";

    try {
        // Send UTR + User Details to the backend request route
        const response = await fetch('https://skilldzire.onrender.com/api/cert/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, utrNumber: utrValue })
        });

        if (response.ok) {
            document.getElementById('utrModal').style.display = 'none';
            document.getElementById('qrModal').style.display = 'none';
            document.getElementById('successModal').style.display = 'flex';
            sessionStorage.removeItem('pendingCertData');
        } else {
            alert("Submission failed. Please try again.");
            confirmBtn.disabled = false;
            confirmBtn.innerText = "Verify Submission";
        }
    } catch (error) {
        alert("Server error. Please check your connection.");
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Verify Submission";
    }
}
