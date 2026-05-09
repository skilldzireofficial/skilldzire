// Function to show custom modal instead of alert
function showStatusModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('statusModal').style.display = 'block';
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

async function checkStatus() {
    const email = document.getElementById('searchEmail').value;
    const resultBox = document.getElementById('resultBox');
    
    // Check if email is empty
    if (!email) {
        showStatusModal("Empty Input", "Please provide a registered email address to check status.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/cert/status/${email}`);
        const data = await response.json();

        if (response.ok) {
            // Show the result card with data
            resultBox.style.display = "block";
            document.getElementById('resName').innerText = data.name;
            document.getElementById('resCourse').innerText = data.course;
            document.getElementById('resStatus').innerText = data.status;

            if (data.status === 'Pending') {
                document.getElementById('resNote').innerText = "* Your request is currently under review. Expect an update within 3-4 hours.";
            } else {
                document.getElementById('resNote').innerText = "* Congratulations! Your certificate has been issued to your email.";
            }
        } else {
            // If email is not found in DB
            resultBox.style.display = "none";
            showStatusModal("No Record Found", "We couldn't find any request associated with this email address.");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        showStatusModal("Server Error", "Unable to reach the server. Please try again later.");
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('statusModal');
    if (event.target == modal) {
        closeStatusModal();
    }
}