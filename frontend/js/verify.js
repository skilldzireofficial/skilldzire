// verify.js - Full Working Code (URL Persistence + Issued At Field)

// 1. Custom Modal Control
function showStatusModal(message) {
    document.getElementById('modalTitle').innerText = "SkillDzire Verification";
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('statusModal').style.display = 'block';
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

// 2. Main Verification Logic
async function verifyCertificate() {
    const certIDInput = document.getElementById('searchID');
    const certID = certIDInput.value.trim();
    const resultBox = document.getElementById('resultBox');
    
    if (!certID) {
        showStatusModal("Mava, enter a valid Certificate ID first!");
        return;
    }

    // --- MAVA IKKADA KOTHA LOGIC: RELOAD AYINA DATA POKUNDA URL UPDATE CHESTHUNNAM ---
    const newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + certID;
    window.history.pushState({ path: newURL }, '', newURL);

    try {
        // Backend API call
        const response = await fetch(`http://localhost:5000/api/cert/verify/${certID}`);
        const data = await response.json();

        if (response.ok && data.success) {
            // Success ayithe details chupistham
            resultBox.style.display = "block";
            document.getElementById('resName').innerText = data.userName;
            document.getElementById('resCourse').innerText = data.course;
            
            const statusElement = document.getElementById('resStatus');
            statusElement.innerText = "VERIFIED ✅";
            statusElement.style.color = "#4caf50"; // Green color

            // Issued At date display chesthunnam
            if (data.issuedAt) {
                const date = new Date(data.issuedAt);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('resDate').innerText = date.toLocaleDateString('en-US', options);
            } else {
                document.getElementById('resDate').innerText = "N/A";
            }
            
            document.getElementById('resNote').innerText = `* Verified Intern of ${data.collegeName || 'SkillDzire'}.`;
        } else {
            // Fail ayithe error message
            resultBox.style.display = "none";
            showStatusModal(data.message || "Invalid ID, No records Found in database!");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        showStatusModal("Server Error! Backend restart chesi chudu mava.");
    }
}

// 3. QR Code & Auto-Verification Logic
// Page load ayinappudu URL lo ID unte (reload/scan), automatic ga details fetch chestundi
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromURL = urlParams.get('id');
    
    if (idFromURL) {
        document.getElementById('searchID').value = idFromURL;
        verifyCertificate();
    }
};

// Modal close logic
window.onclick = function(event) {
    const modal = document.getElementById('statusModal');
    if (event.target == modal) {
        closeStatusModal();
    }
}