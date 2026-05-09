// 1. Custom Modal Control (Old code lo unnadhe mava)
function showStatusModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('statusModal').style.display = 'block';
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

// 2. Main Verification Logic (Modified for Certificate ID)
async function verifyCertificate() {
    // Input field ID ippudu 'searchID' (verify.html lo marchali idi)
    const certID = document.getElementById('searchID').value.trim();
    const resultBox = document.getElementById('resultBox');
    
    if (!certID) {
        showStatusModal("Empty Input");
        return;
    }

    try {
        // Backend kotha route ki request veltundi mava
        const response = await fetch(`https://skilldzire.onrender.com/api/cert/verify/${certID}`);
        const data = await response.json();

        if (response.ok) {
            // Result box lo details display chesthunnam
            resultBox.style.display = "block";
            document.getElementById('resName').innerText = data.userName;
            document.getElementById('resCourse').innerText = data.course;
            document.getElementById('resStatus').innerText = "VERIFIED ✅";
            document.getElementById('resStatus').style.color = "#4caf50"; // Green color
            document.getElementById('resNote').innerText = `* Verified Student of ${data.collegeName || 'SkillDzire'}.`;
        } else {
            resultBox.style.display = "none";
            showStatusModal("Invalid ID, No records Found in database!");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        showStatusModal("Server Error!");
    }
}

// 3. QR Code Logic (Auto-load from URL)
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromURL = urlParams.get('id');
    
    if (idFromURL) {
        // QR scan chesinappudu URL lo ID unte, direct ga input lo petti verify chestundi
        document.getElementById('searchID').value = idFromURL;
        verifyCertificate();
    }
};

// Modal close on outside click
window.onclick = function(event) {
    const modal = document.getElementById('statusModal');
    if (event.target == modal) closeStatusModal();
}