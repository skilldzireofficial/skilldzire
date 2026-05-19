let selectedApp = 'phonepe';
const upiId = "6305358073@ybl"; 
const amount = "1";
const payeeName = "SkillDzire";

// 1. Payment Method Selection
function selectMethod(element, method) {
    document.querySelectorAll('.upi-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    selectedApp = method;
}

// 2. Initial Payment Trigger
function handlePayment() {
    const note = "Internship Certificate Fee";
    const upiUri = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        window.location.href = upiUri;
    } else {
        const qrImg = document.getElementById('qrImg');
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
            document.getElementById('qrModal').style.display = 'flex';
        }
    }
}

// 3. Modal Control Functions
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

function openUTRModal() {
    document.getElementById('utrModal').style.display = 'flex';
}

// 4. MAIN FUNCTION: UTR Submission & Success Modal
async function processUTRSubmission() {
    const utrField = document.getElementById('utrNumber');
    const confirmBtn = document.getElementById('confirmBtn');
    const utrValue = utrField.value.trim();
    
    // sessionStorage నుండి డేటా తెచ్చుకుంటున్నాం
    const userData = JSON.parse(sessionStorage.getItem('pendingCertData')); 

    // UTR Validation
    if (!/^\d{12}$/.test(utrValue)) {
        alert("Please enter a valid 12-digit UTR number.");
        return;
    }

    if (!userData) {
        alert("Session expired. Please fill the form again.");
        window.location.href = '/homepage';
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = "Submitting...";

    try {
        // FIX: ఇక్కడ నీ లైవ్ రెండర్ లింక్ కరెక్ట్ గా ఇచ్చాను మవ
        const response = await fetch('https://skilldzire.onrender.com/api/cert/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, utrNumber: utrValue })
        });

        const result = await response.json();

        if (response.ok) {
            // పాత మోడల్స్ క్లోజ్ చేసి సక్సెస్ మోడల్ ఓపెన్ చేస్తున్నాం
            if (document.getElementById('utrModal')) document.getElementById('utrModal').style.display = 'none';
            if (document.getElementById('qrModal')) document.getElementById('qrModal').style.display = 'none';
            
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'flex'; // ఇదే నీ చెక్ స్టేటస్ పాపప్ మవ
            } else {
                alert("Submission Successful! (Success Modal missing in HTML)");
            }
            
            sessionStorage.removeItem('pendingCertData');
        } else {
            alert("Submission failed: " + (result.message || "Please try again."));
            confirmBtn.disabled = false;
            confirmBtn.innerText = "Verify Submission";
        }
    } catch (error) {
        console.error("Submission Error:", error);
        alert("Server error. Please check your internet connection.");
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Verify Submission";
    }
}