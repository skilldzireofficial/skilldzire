document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check - login kakunda వస్తే వెనక్కి పంపాలి
    const token = sessionStorage.getItem('admin_token');
    
    if (!token || token !== "skilldzire@4404") {
        window.location.href = "/admin-login";
        return;
    }
    fetchRequests();
});

// Logout function
function logout() {
    sessionStorage.removeItem('admin_token'); // clear session
    window.location.href = "/admin-login";
}

// Custom Modal Control
function showStatusModal(title, message) {
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modal = document.getElementById('statusModal');
    
    if (modalTitle && modalMessage && modal) {
        modalTitle.innerText = title;
        modalMessage.innerText = message;
        modal.style.display = 'block';
    }
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.style.display = 'none';
}

// 1. Load data from Backend (GET Request with Headers)
async function fetchRequests() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="loader">Fetching records...</td></tr>';

    try {
        const response = await fetch('https://skilldzire.onrender.com/api/admin/pending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': 'skilldzire@4404' // Nee .env key kachithamga undali
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loader">No pending requests found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
    
        data.forEach(req => {
            const row = `
                <tr>
                    <td><b>${req.userName}</b></td>
                    <td>${req.course}</td>
                    <td>${req.userEmail}</td>
                    <td><code style="color: #FF6600; font-weight:bold;">${req.utrNumber || 'N/A'}</code></td>
                    <td><span class="badge">${req.status}</span></td>
                    <td class="action-btns">
                        <button class="btn-table approve" onclick="approveRequest('${req._id}', event)">Approve</button>
                        <button class="btn-table delete" onclick="deleteRequest('${req._id}')">Delete</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (err) {
        console.error("Fetch error:", err);
        tbody.innerHTML = '<tr><td colspan="6" class="loader" style="color:red;">Failed to connect to server. Check Console!</td></tr>';
    }
}

// 2. Approve Request (POST Request with Headers)
// admin.js - Around Line 65
async function approveRequest(id, event) { // Ikkada 'event' add cheyali mava
    try {
        const btn = event.target; // Ippudu idi crash avvadu
        const originalText = btn.innerText;
        
        btn.innerText = "Generating PDF...";
        btn.disabled = true;

        const response = await fetch(`https://skilldzire.onrender.com/api/admin/approve/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-key': 'skilldzire@4404' // Auth key kachithamga undali
            }
        });
        
        const result = await response.json();

        if(result.success) {
            showStatusModal("Success ✅", "Certificate ID Created & PDF Sent!");
            fetchRequests();
        } else {
            showStatusModal("Error", result.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        showStatusModal("Server Error", "Connection failed mava!");
    }
}

// 3. Delete Request (DELETE Request with Headers if protected)
async function deleteRequest(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        const response = await fetch(`https://skilldzire.onrender.com/api/admin/reject/${id}`, {
            method: 'DELETE',
            headers: {
                'x-admin-key': 'skilldzire@4404'
            }
        });
        
        if (response.ok) {
            showStatusModal("Deleted", "The request record has been removed.");
            fetchRequests();
        } else {
            showStatusModal("Error", "Could not delete the record.");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showStatusModal("Server Error", "Failed to reach the server.");
    }
}